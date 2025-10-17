-- =============================================
-- CHEF PLATFORM DATABASE OPTIMIZATION SCRIPT
-- =============================================
-- This script contains all optimizations for the Chef Platform database
-- Run this script on your Supabase database to apply all optimizations

-- =============================================
-- 1. ENABLE EXTENSIONS
-- =============================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- 2. CREATE OPTIMIZED SCHEMA
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    website_url TEXT,
    is_chef BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    chef_specialties TEXT[],
    years_experience INTEGER DEFAULT 0,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chef verification table
CREATE TABLE IF NOT EXISTS public.chef_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chef_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    verification_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cuisines table
CREATE TABLE IF NOT EXISTS public.cuisines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Dietary restrictions/allergens
CREATE TABLE IF NOT EXISTS public.dietary_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_allergen BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Main recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER GENERATED ALWAYS AS (COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)) STORED,
    servings INTEGER DEFAULT 1,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    cuisine_id UUID REFERENCES public.cuisines(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    video_url TEXT,
    nutrition_info JSONB DEFAULT '{}',
    cooking_methods TEXT[],
    equipment_needed TEXT[],
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    ingredient_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,3),
    unit VARCHAR(50),
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe dietary tags junction table
CREATE TABLE IF NOT EXISTS public.recipe_dietary_tags (
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    dietary_tag_id UUID REFERENCES public.dietary_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, dietary_tag_id)
);

-- Recipe images table
CREATE TABLE IF NOT EXISTS public.recipe_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe ratings table
CREATE TABLE IF NOT EXISTS public.recipe_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id)
);

-- Recipe collections (cookbooks, meal plans, etc.)
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    cover_image_url TEXT,
    recipe_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Collection recipes junction table
CREATE TABLE IF NOT EXISTS public.collection_recipes (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, recipe_id)
);

-- User saved recipes (favorites)
CREATE TABLE IF NOT EXISTS public.saved_recipes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

-- User follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Recipe views tracking
CREATE TABLE IF NOT EXISTS public.recipe_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe interactions (likes, shares, etc.)
CREATE TABLE IF NOT EXISTS public.recipe_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'bookmark')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id, interaction_type)
);

-- =============================================
-- 3. CREATE PERFORMANCE INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_chef ON public.profiles(is_chef) WHERE is_chef = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Recipe indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_author_id ON public.recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON public.recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_id ON public.recipes(cuisine_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_published ON public.recipes(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_is_featured ON public.recipes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_recipes_updated_at ON public.recipes(updated_at);
CREATE INDEX IF NOT EXISTS idx_recipes_published_at ON public.recipes(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_rating_average ON public.recipes(rating_average);
CREATE INDEX IF NOT EXISTS idx_recipes_view_count ON public.recipes(view_count);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty_level ON public.recipes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON public.recipes(total_time_minutes);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_recipes_title_search ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_recipes_description_search ON public.recipes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_recipes_instructions_search ON public.recipes USING gin(to_tsvector('english', instructions));
CREATE INDEX IF NOT EXISTS idx_recipes_tags_search ON public.recipes USING gin(tags);

-- Recipe ingredients indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_name ON public.recipe_ingredients(ingredient_name);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_sort_order ON public.recipe_ingredients(recipe_id, sort_order);

-- Rating indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON public.recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON public.recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_rating ON public.recipe_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_created_at ON public.recipe_ratings(created_at);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_author_id ON public.collections(author_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON public.collections(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_collections_is_featured ON public.collections(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at);

-- Follow system indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_recipe_views_recipe_id ON public.recipe_views(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_user_id ON public.recipe_views(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_viewed_at ON public.recipe_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_recipe_id ON public.recipe_interactions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_user_id ON public.recipe_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_type ON public.recipe_interactions(interaction_type);

-- =============================================
-- 4. CREATE OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update recipe rating statistics
CREATE OR REPLACE FUNCTION update_recipe_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.recipes 
        SET 
            rating_average = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM public.recipe_ratings 
                WHERE recipe_id = NEW.recipe_id
            ),
            rating_count = (
                SELECT COUNT(*) 
                FROM public.recipe_ratings 
                WHERE recipe_id = NEW.recipe_id
            )
        WHERE id = NEW.recipe_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.recipes 
        SET 
            rating_average = COALESCE((
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM public.recipe_ratings 
                WHERE recipe_id = OLD.recipe_id
            ), 0.00),
            rating_count = (
                SELECT COUNT(*) 
                FROM public.recipe_ratings 
                WHERE recipe_id = OLD.recipe_id
            )
        WHERE id = OLD.recipe_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update collection recipe count
CREATE OR REPLACE FUNCTION update_collection_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.collections 
        SET recipe_count = recipe_count + 1 
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.collections 
        SET recipe_count = recipe_count - 1 
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- =============================================
-- 5. CREATE TRIGGERS
-- =============================================

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_ratings_updated_at ON public.recipe_ratings;
CREATE TRIGGER update_recipe_ratings_updated_at BEFORE UPDATE ON public.recipe_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply rating update triggers
DROP TRIGGER IF EXISTS update_recipe_rating_stats_trigger ON public.recipe_ratings;
CREATE TRIGGER update_recipe_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ratings
    FOR EACH ROW EXECUTE FUNCTION update_recipe_rating_stats();

-- Apply collection count update triggers
DROP TRIGGER IF EXISTS update_collection_recipe_count_trigger ON public.collection_recipes;
CREATE TRIGGER update_collection_recipe_count_trigger
    AFTER INSERT OR DELETE ON public.collection_recipes
    FOR EACH ROW EXECUTE FUNCTION update_collection_recipe_count();

-- =============================================
-- 6. CREATE ADVANCED SEARCH FUNCTIONS
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
        AND r.published_at >= NOW() - (time_period * 2)
    ORDER BY trend_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. CREATE ANALYTICS FUNCTIONS
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
-- 8. CREATE MATERIALIZED VIEWS
-- =============================================

-- Materialized view for popular recipes
DROP MATERIALIZED VIEW IF EXISTS popular_recipes;
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

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_popular_recipes_score ON popular_recipes(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_popular_recipes_category ON popular_recipes(category_name);
CREATE INDEX IF NOT EXISTS idx_popular_recipes_cuisine ON popular_recipes(cuisine_name);

-- Materialized view for chef statistics
DROP MATERIALIZED VIEW IF EXISTS chef_stats;
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

-- Create indexes on chef stats
CREATE INDEX IF NOT EXISTS idx_chef_stats_views ON chef_stats(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_chef_stats_rating ON chef_stats(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_chef_stats_followers ON chef_stats(followers_count DESC);

-- =============================================
-- 9. CREATE UTILITY FUNCTIONS
-- =============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes;
    REFRESH MATERIALIZED VIEW CONCURRENTLY chef_stats;
END;
$$ LANGUAGE plpgsql;

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
-- 10. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 11. CREATE RLS POLICIES
-- =============================================

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
DROP POLICY IF EXISTS "Published recipes are viewable by everyone" ON public.recipes;
CREATE POLICY "Published recipes are viewable by everyone" ON public.recipes FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
CREATE POLICY "Users can insert their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe ratings policies
DROP POLICY IF EXISTS "Anyone can view recipe ratings" ON public.recipe_ratings;
CREATE POLICY "Anyone can view recipe ratings" ON public.recipe_ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.recipe_ratings;
CREATE POLICY "Users can insert their own ratings" ON public.recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.recipe_ratings;
CREATE POLICY "Users can update their own ratings" ON public.recipe_ratings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.recipe_ratings;
CREATE POLICY "Users can delete their own ratings" ON public.recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
DROP POLICY IF EXISTS "Public collections are viewable by everyone" ON public.collections;
CREATE POLICY "Public collections are viewable by everyone" ON public.collections FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
CREATE POLICY "Users can insert their own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;
CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE USING (auth.uid() = author_id);

-- Saved recipes policies
DROP POLICY IF EXISTS "Users can view their own saved recipes" ON public.saved_recipes;
CREATE POLICY "Users can view their own saved recipes" ON public.saved_recipes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved recipes" ON public.saved_recipes;
CREATE POLICY "Users can insert their own saved recipes" ON public.saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved recipes" ON public.saved_recipes;
CREATE POLICY "Users can delete their own saved recipes" ON public.saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- User follows policies
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own follows" ON public.user_follows;
CREATE POLICY "Users can insert their own follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete their own follows" ON public.user_follows;
CREATE POLICY "Users can delete their own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Recipe interactions policies
DROP POLICY IF EXISTS "Anyone can view recipe interactions" ON public.recipe_interactions;
CREATE POLICY "Anyone can view recipe interactions" ON public.recipe_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.recipe_interactions;
CREATE POLICY "Users can insert their own interactions" ON public.recipe_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.recipe_interactions;
CREATE POLICY "Users can delete their own interactions" ON public.recipe_interactions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 12. INSERT SAMPLE DATA
-- =============================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
('Appetizers', 'appetizers', 'Small dishes served before the main course'),
('Main Courses', 'main-courses', 'Primary dishes of a meal'),
('Desserts', 'desserts', 'Sweet courses served at the end of a meal'),
('Beverages', 'beverages', 'Drinks and liquid refreshments'),
('Breakfast', 'breakfast', 'Morning meal dishes'),
('Lunch', 'lunch', 'Midday meal dishes'),
('Dinner', 'dinner', 'Evening meal dishes'),
('Snacks', 'snacks', 'Light food items between meals')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample cuisines
INSERT INTO public.cuisines (name, slug, description, region) VALUES
('Italian', 'italian', 'Traditional Italian cuisine', 'Italy'),
('Mexican', 'mexican', 'Traditional Mexican cuisine', 'Mexico'),
('Asian', 'asian', 'Various Asian cuisines', 'Asia'),
('American', 'american', 'Traditional American cuisine', 'United States'),
('French', 'french', 'Traditional French cuisine', 'France'),
('Indian', 'indian', 'Traditional Indian cuisine', 'India'),
('Mediterranean', 'mediterranean', 'Mediterranean region cuisine', 'Mediterranean'),
('Thai', 'thai', 'Traditional Thai cuisine', 'Thailand')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample dietary tags
INSERT INTO public.dietary_tags (name, slug, description, is_allergen) VALUES
('Vegetarian', 'vegetarian', 'Contains no meat or fish', false),
('Vegan', 'vegan', 'Contains no animal products', false),
('Gluten-Free', 'gluten-free', 'Contains no gluten', false),
('Dairy-Free', 'dairy-free', 'Contains no dairy products', false),
('Nut-Free', 'nut-free', 'Contains no nuts', true),
('Soy-Free', 'soy-free', 'Contains no soy', true),
('Egg-Free', 'egg-free', 'Contains no eggs', true),
('Shellfish-Free', 'shellfish-free', 'Contains no shellfish', true),
('Low-Carb', 'low-carb', 'Low in carbohydrates', false),
('Keto', 'keto', 'Ketogenic diet friendly', false),
('Paleo', 'paleo', 'Paleolithic diet friendly', false),
('Halal', 'halal', 'Halal certified', false),
('Kosher', 'kosher', 'Kosher certified', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 13. FINAL OPTIMIZATIONS
-- =============================================

-- Update table statistics for better query planning
ANALYZE public.profiles;
ANALYZE public.recipes;
ANALYZE public.recipe_ingredients;
ANALYZE public.recipe_ratings;
ANALYZE public.collections;
ANALYZE public.user_follows;
ANALYZE public.recipe_views;
ANALYZE public.recipe_interactions;

-- Refresh materialized views
SELECT refresh_materialized_views();

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Chef Platform Database Optimization Complete!';
    RAISE NOTICE 'All tables, indexes, functions, and policies have been created.';
    RAISE NOTICE 'The database is now optimized for performance and scalability.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the search functions with sample queries';
    RAISE NOTICE '2. Monitor query performance and adjust indexes as needed';
    RAISE NOTICE '3. Set up regular maintenance tasks for materialized views';
    RAISE NOTICE '4. Configure monitoring and alerting for production use';
END $$;