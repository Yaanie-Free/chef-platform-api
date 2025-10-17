-- Performance optimization functions and views
-- Additional functions for better query performance and analytics

-- =============================================
-- SEARCH AND FILTERING FUNCTIONS
-- =============================================

-- Function to search recipes with advanced filtering
CREATE OR REPLACE FUNCTION search_recipes(
    search_query TEXT DEFAULT '',
    category_ids UUID[] DEFAULT NULL,
    cuisine_ids UUID[] DEFAULT NULL,
    dietary_tag_ids UUID[] DEFAULT NULL,
    min_rating DECIMAL(3,2) DEFAULT 0,
    max_prep_time INTEGER DEFAULT NULL,
    max_cook_time INTEGER DEFAULT NULL,
    difficulty_levels INTEGER[] DEFAULT NULL,
    author_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    servings INTEGER,
    difficulty_level INTEGER,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    view_count INTEGER,
    featured_image_url TEXT,
    author_name VARCHAR(100),
    category_name VARCHAR(100),
    cuisine_name VARCHAR(100),
    created_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.slug,
        r.description,
        r.prep_time_minutes,
        r.cook_time_minutes,
        r.total_time_minutes,
        r.servings,
        r.difficulty_level,
        r.rating_average,
        r.rating_count,
        r.view_count,
        r.featured_image_url,
        p.display_name as author_name,
        c.name as category_name,
        cu.name as cuisine_name,
        r.created_at,
        r.published_at,
        CASE 
            WHEN search_query = '' THEN 0
            ELSE ts_rank(
                to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.instructions, '')),
                plainto_tsquery('english', search_query)
            )
        END as rank
    FROM public.recipes r
    LEFT JOIN public.profiles p ON r.author_id = p.id
    LEFT JOIN public.categories c ON r.category_id = c.id
    LEFT JOIN public.cuisines cu ON r.cuisine_id = cu.id
    WHERE r.is_published = TRUE
        AND (search_query = '' OR to_tsvector('english', r.title || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.instructions, '')) @@ plainto_tsquery('english', search_query))
        AND (category_ids IS NULL OR r.category_id = ANY(category_ids))
        AND (cuisine_ids IS NULL OR r.cuisine_id = ANY(cuisine_ids))
        AND (author_id IS NULL OR r.author_id = author_id)
        AND r.rating_average >= min_rating
        AND (max_prep_time IS NULL OR r.prep_time_minutes <= max_prep_time)
        AND (max_cook_time IS NULL OR r.cook_time_minutes <= max_cook_time)
        AND (difficulty_levels IS NULL OR r.difficulty_level = ANY(difficulty_levels))
        AND (dietary_tag_ids IS NULL OR EXISTS (
            SELECT 1 FROM public.recipe_dietary_tags rdt 
            WHERE rdt.recipe_id = r.id 
            AND rdt.dietary_tag_id = ANY(dietary_tag_ids)
        ))
    ORDER BY 
        CASE WHEN search_query = '' THEN r.created_at END DESC,
        CASE WHEN search_query != '' THEN rank END DESC,
        r.rating_average DESC,
        r.view_count DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recipe recommendations for a user
CREATE OR REPLACE FUNCTION get_recipe_recommendations(
    user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    featured_image_url TEXT,
    author_name VARCHAR(100),
    recommendation_score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_preferences AS (
        -- Get user's favorite categories and cuisines
        SELECT 
            r.category_id,
            r.cuisine_id,
            COUNT(*) as preference_weight
        FROM public.recipes r
        INNER JOIN public.saved_recipes sr ON r.id = sr.recipe_id
        WHERE sr.user_id = get_recipe_recommendations.user_id
        GROUP BY r.category_id, r.cuisine_id
    ),
    similar_users AS (
        -- Find users with similar taste
        SELECT DISTINCT sr2.user_id
        FROM public.saved_recipes sr1
        INNER JOIN public.saved_recipes sr2 ON sr1.recipe_id = sr2.recipe_id
        WHERE sr1.user_id = get_recipe_recommendations.user_id
        AND sr2.user_id != get_recipe_recommendations.user_id
        GROUP BY sr2.user_id
        HAVING COUNT(*) >= 2
    )
    SELECT 
        r.id,
        r.title,
        r.slug,
        r.description,
        r.rating_average,
        r.rating_count,
        r.featured_image_url,
        p.display_name as author_name,
        (
            COALESCE(up.preference_weight, 0) * 0.4 +
            COALESCE(r.rating_average, 0) * 0.3 +
            COALESCE(r.view_count, 0) * 0.001 +
            CASE WHEN EXISTS(SELECT 1 FROM similar_users su WHERE su.user_id = r.author_id) THEN 0.3 ELSE 0 END
        ) as recommendation_score
    FROM public.recipes r
    LEFT JOIN public.profiles p ON r.author_id = p.id
    LEFT JOIN user_preferences up ON r.category_id = up.category_id AND r.cuisine_id = up.cuisine_id
    WHERE r.is_published = TRUE
        AND r.id NOT IN (
            SELECT recipe_id FROM public.saved_recipes 
            WHERE user_id = get_recipe_recommendations.user_id
        )
    ORDER BY recommendation_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending recipes
CREATE OR REPLACE FUNCTION get_trending_recipes(
    time_period INTERVAL DEFAULT '7 days',
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    view_count INTEGER,
    featured_image_url TEXT,
    author_name VARCHAR(100),
    trend_score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_activity AS (
        SELECT 
            recipe_id,
            COUNT(*) as recent_views,
            COUNT(DISTINCT user_id) as unique_viewers
        FROM public.recipe_views
        WHERE viewed_at >= NOW() - time_period
        GROUP BY recipe_id
    ),
    recent_ratings AS (
        SELECT 
            recipe_id,
            COUNT(*) as recent_ratings,
            AVG(rating) as recent_avg_rating
        FROM public.recipe_ratings
        WHERE created_at >= NOW() - time_period
        GROUP BY recipe_id
    )
    SELECT 
        r.id,
        r.title,
        r.slug,
        r.description,
        r.rating_average,
        r.rating_count,
        r.view_count,
        r.featured_image_url,
        p.display_name as author_name,
        (
            COALESCE(ra.recent_views, 0) * 0.4 +
            COALESCE(ra.unique_viewers, 0) * 0.3 +
            COALESCE(rr.recent_ratings, 0) * 0.2 +
            COALESCE(rr.recent_avg_rating, 0) * 0.1
        ) as trend_score
    FROM public.recipes r
    LEFT JOIN public.profiles p ON r.author_id = p.id
    LEFT JOIN recent_activity ra ON r.id = ra.recipe_id
    LEFT JOIN recent_ratings rr ON r.id = rr.recipe_id
    WHERE r.is_published = TRUE
        AND r.published_at >= NOW() - (time_period * 2) -- Only include recipes published within 2x the time period
    ORDER BY trend_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_id UUID)
RETURNS TABLE (
    total_recipes INTEGER,
    total_views BIGINT,
    total_ratings BIGINT,
    average_rating DECIMAL(3,2),
    total_followers BIGINT,
    total_following BIGINT,
    total_collections INTEGER,
    total_saved_recipes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.recipes WHERE author_id = user_id) as total_recipes,
        (SELECT COALESCE(SUM(view_count), 0) FROM public.recipes WHERE author_id = user_id) as total_views,
        (SELECT COUNT(*) FROM public.recipe_ratings rr INNER JOIN public.recipes r ON rr.recipe_id = r.id WHERE r.author_id = user_id) as total_ratings,
        (SELECT COALESCE(AVG(rr.rating), 0)::DECIMAL(3,2) FROM public.recipe_ratings rr INNER JOIN public.recipes r ON rr.recipe_id = r.id WHERE r.author_id = user_id) as average_rating,
        (SELECT COUNT(*) FROM public.user_follows WHERE following_id = user_id) as total_followers,
        (SELECT COUNT(*) FROM public.user_follows WHERE follower_id = user_id) as total_following,
        (SELECT COUNT(*)::INTEGER FROM public.collections WHERE author_id = user_id) as total_collections,
        (SELECT COUNT(*) FROM public.saved_recipes WHERE user_id = user_id) as total_saved_recipes;
END;
$$ LANGUAGE plpgsql;

-- Function to get recipe analytics
CREATE OR REPLACE FUNCTION get_recipe_analytics(recipe_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_viewers BIGINT,
    total_ratings BIGINT,
    average_rating DECIMAL(3,2),
    total_saves BIGINT,
    total_shares BIGINT,
    total_likes BIGINT,
    views_last_7_days BIGINT,
    views_last_30_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COALESCE(SUM(view_count), 0) FROM public.recipes WHERE id = recipe_id) as total_views,
        (SELECT COUNT(DISTINCT user_id) FROM public.recipe_views WHERE recipe_id = get_recipe_analytics.recipe_id) as unique_viewers,
        (SELECT COUNT(*) FROM public.recipe_ratings WHERE recipe_id = get_recipe_analytics.recipe_id) as total_ratings,
        (SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) FROM public.recipe_ratings WHERE recipe_id = get_recipe_analytics.recipe_id) as average_rating,
        (SELECT COUNT(*) FROM public.saved_recipes WHERE recipe_id = get_recipe_analytics.recipe_id) as total_saves,
        (SELECT COUNT(*) FROM public.recipe_interactions WHERE recipe_id = get_recipe_analytics.recipe_id AND interaction_type = 'share') as total_shares,
        (SELECT COUNT(*) FROM public.recipe_interactions WHERE recipe_id = get_recipe_analytics.recipe_id AND interaction_type = 'like') as total_likes,
        (SELECT COUNT(*) FROM public.recipe_views WHERE recipe_id = get_recipe_analytics.recipe_id AND viewed_at >= NOW() - INTERVAL '7 days') as views_last_7_days,
        (SELECT COUNT(*) FROM public.recipe_views WHERE recipe_id = get_recipe_analytics.recipe_id AND viewed_at >= NOW() - INTERVAL '30 days') as views_last_30_days;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================

-- Materialized view for popular recipes
CREATE MATERIALIZED VIEW popular_recipes AS
SELECT 
    r.id,
    r.title,
    r.slug,
    r.rating_average,
    r.rating_count,
    r.view_count,
    r.featured_image_url,
    p.display_name as author_name,
    c.name as category_name,
    cu.name as cuisine_name,
    (
        COALESCE(r.rating_average, 0) * 0.4 +
        COALESCE(r.rating_count, 0) * 0.001 +
        COALESCE(r.view_count, 0) * 0.0001
    ) as popularity_score
FROM public.recipes r
LEFT JOIN public.profiles p ON r.author_id = p.id
LEFT JOIN public.categories c ON r.category_id = c.id
LEFT JOIN public.cuisines cu ON r.cuisine_id = cu.id
WHERE r.is_published = TRUE
ORDER BY popularity_score DESC;

-- Create index on materialized view
CREATE INDEX idx_popular_recipes_score ON popular_recipes(popularity_score DESC);
CREATE INDEX idx_popular_recipes_category ON popular_recipes(category_name);
CREATE INDEX idx_popular_recipes_cuisine ON popular_recipes(cuisine_name);

-- Materialized view for chef statistics
CREATE MATERIALIZED VIEW chef_stats AS
SELECT 
    p.id as chef_id,
    p.display_name,
    p.username,
    COUNT(r.id) as total_recipes,
    COALESCE(SUM(r.view_count), 0) as total_views,
    COALESCE(AVG(r.rating_average), 0) as average_rating,
    COALESCE(SUM(r.rating_count), 0) as total_ratings,
    COUNT(DISTINCT uf.follower_id) as followers_count
FROM public.profiles p
LEFT JOIN public.recipes r ON p.id = r.author_id AND r.is_published = TRUE
LEFT JOIN public.user_follows uf ON p.id = uf.following_id
WHERE p.is_chef = TRUE
GROUP BY p.id, p.display_name, p.username
ORDER BY total_views DESC;

-- Create index on chef stats
CREATE INDEX idx_chef_stats_views ON chef_stats(total_views DESC);
CREATE INDEX idx_chef_stats_rating ON chef_stats(average_rating DESC);
CREATE INDEX idx_chef_stats_followers ON chef_stats(followers_count DESC);

-- =============================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- =============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes;
    REFRESH MATERIALIZED VIEW CONCURRENTLY chef_stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS VOID AS $$
BEGIN
    -- Delete recipe views older than 1 year
    DELETE FROM public.recipe_views 
    WHERE viewed_at < NOW() - INTERVAL '1 year';
    
    -- Delete old recipe interactions (keep last 6 months)
    DELETE FROM public.recipe_interactions 
    WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =============================================

-- Schedule materialized view refresh (daily at 2 AM)
-- SELECT cron.schedule('refresh-materialized-views', '0 2 * * *', 'SELECT refresh_materialized_views();');

-- Schedule analytics cleanup (weekly on Sunday at 3 AM)
-- SELECT cron.schedule('cleanup-analytics', '0 3 * * 0', 'SELECT cleanup_old_analytics();');