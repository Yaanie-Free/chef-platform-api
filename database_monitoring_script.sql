-- =============================================
-- CHEF PLATFORM DATABASE MONITORING SCRIPT
-- =============================================
-- This script provides comprehensive monitoring and maintenance functions
-- for the Chef Platform database

-- =============================================
-- 1. PERFORMANCE MONITORING FUNCTIONS
-- =============================================

-- Function to get database performance metrics
CREATE OR REPLACE FUNCTION get_database_performance_metrics()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_unit TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH db_stats AS (
        SELECT 
            (SELECT COUNT(*) FROM public.recipes WHERE is_published = TRUE) as total_recipes,
            (SELECT COUNT(*) FROM public.profiles WHERE is_chef = TRUE) as total_chefs,
            (SELECT COUNT(*) FROM public.recipe_ratings) as total_ratings,
            (SELECT AVG(rating) FROM public.recipe_ratings) as avg_rating,
            (SELECT COUNT(*) FROM public.recipe_views) as total_views,
            (SELECT COUNT(*) FROM public.user_follows) as total_follows,
            (SELECT pg_database_size(current_database())) as db_size_bytes
    )
    SELECT 
        'Total Published Recipes'::TEXT as metric_name,
        total_recipes::NUMERIC as metric_value,
        'count'::TEXT as metric_unit,
        'Number of published recipes in the database'::TEXT as description
    FROM db_stats
    UNION ALL
    SELECT 
        'Total Chefs'::TEXT,
        total_chefs::NUMERIC,
        'count'::TEXT,
        'Number of verified chefs in the platform'::TEXT
    FROM db_stats
    UNION ALL
    SELECT 
        'Total Ratings'::TEXT,
        total_ratings::NUMERIC,
        'count'::TEXT,
        'Total number of recipe ratings'::TEXT
    FROM db_stats
    UNION ALL
    SELECT 
        'Average Rating'::TEXT,
        ROUND(avg_rating::NUMERIC, 2),
        'stars'::TEXT,
        'Average rating across all recipes'::TEXT
    FROM db_stats
    UNION ALL
    SELECT 
        'Total Views'::TEXT,
        total_views::NUMERIC,
        'count'::TEXT,
        'Total recipe views tracked'::TEXT
    FROM db_stats
    UNION ALL
    SELECT 
        'Total Follows'::TEXT,
        total_follows::NUMERIC,
        'count'::TEXT,
        'Total user follows in the platform'::TEXT
    FROM db_stats
    UNION ALL
    SELECT 
        'Database Size'::TEXT,
        ROUND(db_size_bytes::NUMERIC / 1024 / 1024, 2),
        'MB'::TEXT,
        'Current database size in megabytes'::TEXT
    FROM db_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get slow query analysis
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query_text TEXT,
    calls BIGINT,
    total_time NUMERIC,
    mean_time NUMERIC,
    max_time NUMERIC,
    min_time NUMERIC,
    stddev_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LEFT(pg_stat_statements.query, 100) as query_text,
        pg_stat_statements.calls,
        ROUND(pg_stat_statements.total_exec_time::NUMERIC, 2) as total_time,
        ROUND(pg_stat_statements.mean_exec_time::NUMERIC, 2) as mean_time,
        ROUND(pg_stat_statements.max_exec_time::NUMERIC, 2) as max_time,
        ROUND(pg_stat_statements.min_exec_time::NUMERIC, 2) as min_time,
        ROUND(pg_stat_statements.stddev_exec_time::NUMERIC, 2) as stddev_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > 1000 -- Queries taking more than 1 second on average
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    index_scans BIGINT,
    tuples_read BIGINT,
    tuples_fetched BIGINT,
    usage_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched,
        CASE 
            WHEN idx_scan = 0 THEN 0
            ELSE ROUND((idx_tup_fetch::NUMERIC / idx_scan), 2)
        END as usage_ratio
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    last_vacuum TIMESTAMPTZ,
    last_analyze TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        last_vacuum,
        last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. MAINTENANCE FUNCTIONS
-- =============================================

-- Function to perform database maintenance
CREATE OR REPLACE FUNCTION perform_database_maintenance()
RETURNS TABLE (
    operation TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Update table statistics
    ANALYZE public.profiles;
    ANALYZE public.recipes;
    ANALYZE public.recipe_ingredients;
    ANALYZE public.recipe_ratings;
    ANALYZE public.collections;
    ANALYZE public.user_follows;
    ANALYZE public.recipe_views;
    ANALYZE public.recipe_interactions;
    
    RETURN QUERY SELECT 'Update Statistics'::TEXT, 'Completed'::TEXT, 'All table statistics updated'::TEXT;
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes;
    REFRESH MATERIALIZED VIEW CONCURRENTLY chef_stats;
    
    RETURN QUERY SELECT 'Refresh Materialized Views'::TEXT, 'Completed'::TEXT, 'Popular recipes and chef stats views refreshed'::TEXT;
    
    -- Clean up old analytics data
    PERFORM cleanup_old_analytics();
    
    RETURN QUERY SELECT 'Cleanup Old Data'::TEXT, 'Completed'::TEXT, 'Old analytics data cleaned up'::TEXT;
    
    -- Vacuum tables
    VACUUM ANALYZE public.recipe_views;
    VACUUM ANALYZE public.recipe_interactions;
    
    RETURN QUERY SELECT 'Vacuum Tables'::TEXT, 'Completed'::TEXT, 'High-activity tables vacuumed'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to check for potential issues
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    message TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check for unused indexes
    RETURN QUERY
    SELECT 
        'Unused Indexes'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END as status,
        COUNT(*)::TEXT || ' unused indexes found' as message,
        CASE 
            WHEN COUNT(*) > 0 THEN 'Consider dropping unused indexes to save space'::TEXT
            ELSE 'No action needed'::TEXT
        END as recommendation
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public' AND idx_scan = 0;
    
    -- Check for tables that need vacuuming
    RETURN QUERY
    SELECT 
        'Tables Needing Vacuum'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END as status,
        COUNT(*)::TEXT || ' tables need vacuuming' as message,
        CASE 
            WHEN COUNT(*) > 0 THEN 'Run VACUUM on these tables to reclaim space'::TEXT
            ELSE 'No action needed'::TEXT
        END as recommendation
    FROM pg_stat_user_tables
    WHERE schemaname = 'public' 
    AND (last_vacuum IS NULL OR last_vacuum < NOW() - INTERVAL '7 days')
    AND n_dead_tup > 0;
    
    -- Check for tables that need analyzing
    RETURN QUERY
    SELECT 
        'Tables Needing Analysis'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) > 0 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END as status,
        COUNT(*)::TEXT || ' tables need analysis' as message,
        CASE 
            WHEN COUNT(*) > 0 THEN 'Run ANALYZE on these tables to update statistics'::TEXT
            ELSE 'No action needed'::TEXT
        END as recommendation
    FROM pg_stat_user_tables
    WHERE schemaname = 'public' 
    AND (last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '1 day');
    
    -- Check database size
    RETURN QUERY
    SELECT 
        'Database Size'::TEXT as check_name,
        CASE 
            WHEN pg_database_size(current_database()) > 1000000000 THEN 'WARNING'::TEXT -- 1GB
            ELSE 'OK'::TEXT
        END as status,
        pg_size_pretty(pg_database_size(current_database())) as message,
        CASE 
            WHEN pg_database_size(current_database()) > 1000000000 THEN 'Consider archiving old data or optimizing storage'::TEXT
            ELSE 'Database size is within acceptable limits'::TEXT
        END as recommendation;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. ANALYTICS AND REPORTING FUNCTIONS
-- =============================================

-- Function to get platform growth metrics
CREATE OR REPLACE FUNCTION get_platform_growth_metrics(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    metric_name TEXT,
    current_value BIGINT,
    previous_value BIGINT,
    growth_rate NUMERIC,
    trend TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COUNT(DISTINCT p.id) as new_users,
            COUNT(DISTINCT r.id) as new_recipes,
            COUNT(DISTINCT rr.id) as new_ratings,
            COUNT(DISTINCT rv.id) as new_views
        FROM public.profiles p
        LEFT JOIN public.recipes r ON p.id = r.author_id AND r.created_at >= NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN public.recipe_ratings rr ON rr.created_at >= NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN public.recipe_views rv ON rv.viewed_at >= NOW() - (days_back || ' days')::INTERVAL
        WHERE p.created_at >= NOW() - (days_back || ' days')::INTERVAL
    ),
    previous_period AS (
        SELECT 
            COUNT(DISTINCT p.id) as new_users,
            COUNT(DISTINCT r.id) as new_recipes,
            COUNT(DISTINCT rr.id) as new_ratings,
            COUNT(DISTINCT rv.id) as new_views
        FROM public.profiles p
        LEFT JOIN public.recipes r ON p.id = r.author_id AND r.created_at >= NOW() - (days_back * 2 || ' days')::INTERVAL AND r.created_at < NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN public.recipe_ratings rr ON rr.created_at >= NOW() - (days_back * 2 || ' days')::INTERVAL AND rr.created_at < NOW() - (days_back || ' days')::INTERVAL
        LEFT JOIN public.recipe_views rv ON rv.viewed_at >= NOW() - (days_back * 2 || ' days')::INTERVAL AND rv.viewed_at < NOW() - (days_back || ' days')::INTERVAL
        WHERE p.created_at >= NOW() - (days_back * 2 || ' days')::INTERVAL AND p.created_at < NOW() - (days_back || ' days')::INTERVAL
    )
    SELECT 
        'New Users'::TEXT as metric_name,
        cp.new_users as current_value,
        pp.new_users as previous_value,
        CASE 
            WHEN pp.new_users = 0 THEN 0
            ELSE ROUND(((cp.new_users - pp.new_users)::NUMERIC / pp.new_users * 100), 2)
        END as growth_rate,
        CASE 
            WHEN cp.new_users > pp.new_users THEN 'Up'::TEXT
            WHEN cp.new_users < pp.new_users THEN 'Down'::TEXT
            ELSE 'Stable'::TEXT
        END as trend
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'New Recipes'::TEXT,
        cp.new_recipes,
        pp.new_recipes,
        CASE 
            WHEN pp.new_recipes = 0 THEN 0
            ELSE ROUND(((cp.new_recipes - pp.new_recipes)::NUMERIC / pp.new_recipes * 100), 2)
        END,
        CASE 
            WHEN cp.new_recipes > pp.new_recipes THEN 'Up'::TEXT
            WHEN cp.new_recipes < pp.new_recipes THEN 'Down'::TEXT
            ELSE 'Stable'::TEXT
        END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'New Ratings'::TEXT,
        cp.new_ratings,
        pp.new_ratings,
        CASE 
            WHEN pp.new_ratings = 0 THEN 0
            ELSE ROUND(((cp.new_ratings - pp.new_ratings)::NUMERIC / pp.new_ratings * 100), 2)
        END,
        CASE 
            WHEN cp.new_ratings > pp.new_ratings THEN 'Up'::TEXT
            WHEN cp.new_ratings < pp.new_ratings THEN 'Down'::TEXT
            ELSE 'Stable'::TEXT
        END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'New Views'::TEXT,
        cp.new_views,
        pp.new_views,
        CASE 
            WHEN pp.new_views = 0 THEN 0
            ELSE ROUND(((cp.new_views - pp.new_views)::NUMERIC / pp.new_views * 100), 2)
        END,
        CASE 
            WHEN cp.new_views > pp.new_views THEN 'Up'::TEXT
            WHEN cp.new_views < pp.new_views THEN 'Down'::TEXT
            ELSE 'Stable'::TEXT
        END
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing content
CREATE OR REPLACE FUNCTION get_top_performing_content(
    content_type TEXT DEFAULT 'recipes',
    limit_count INTEGER DEFAULT 10,
    time_period INTERVAL DEFAULT '30 days'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    author_name TEXT,
    performance_score NUMERIC,
    views BIGINT,
    ratings BIGINT,
    avg_rating NUMERIC,
    saves BIGINT,
    shares BIGINT
) AS $$
BEGIN
    IF content_type = 'recipes' THEN
        RETURN QUERY
        SELECT 
            r.id,
            r.title,
            p.display_name as author_name,
            (
                COALESCE(r.view_count, 0) * 0.3 +
                COALESCE(r.rating_count, 0) * 0.2 +
                COALESCE(r.rating_average, 0) * 10 * 0.3 +
                COALESCE(save_count.saves, 0) * 0.1 +
                COALESCE(share_count.shares, 0) * 0.1
            ) as performance_score,
            r.view_count as views,
            r.rating_count as ratings,
            r.rating_average as avg_rating,
            COALESCE(save_count.saves, 0) as saves,
            COALESCE(share_count.shares, 0) as shares
        FROM public.recipes r
        LEFT JOIN public.profiles p ON r.author_id = p.id
        LEFT JOIN (
            SELECT recipe_id, COUNT(*) as saves
            FROM public.saved_recipes
            WHERE saved_at >= NOW() - time_period
            GROUP BY recipe_id
        ) save_count ON r.id = save_count.recipe_id
        LEFT JOIN (
            SELECT recipe_id, COUNT(*) as shares
            FROM public.recipe_interactions
            WHERE interaction_type = 'share' AND created_at >= NOW() - time_period
            GROUP BY recipe_id
        ) share_count ON r.id = share_count.recipe_id
        WHERE r.is_published = TRUE
        AND r.created_at >= NOW() - time_period
        ORDER BY performance_score DESC
        LIMIT limit_count;
    ELSIF content_type = 'chefs' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.display_name as title,
            p.display_name as author_name,
            (
                COALESCE(recipe_count.recipes, 0) * 0.2 +
                COALESCE(total_views.views, 0) * 0.3 +
                COALESCE(avg_rating.rating, 0) * 10 * 0.3 +
                COALESCE(follower_count.followers, 0) * 0.2
            ) as performance_score,
            COALESCE(total_views.views, 0) as views,
            COALESCE(rating_count.ratings, 0) as ratings,
            COALESCE(avg_rating.rating, 0) as avg_rating,
            0 as saves,
            0 as shares
        FROM public.profiles p
        LEFT JOIN (
            SELECT author_id, COUNT(*) as recipes
            FROM public.recipes
            WHERE is_published = TRUE AND created_at >= NOW() - time_period
            GROUP BY author_id
        ) recipe_count ON p.id = recipe_count.author_id
        LEFT JOIN (
            SELECT r.author_id, SUM(r.view_count) as views
            FROM public.recipes r
            WHERE r.created_at >= NOW() - time_period
            GROUP BY r.author_id
        ) total_views ON p.id = total_views.author_id
        LEFT JOIN (
            SELECT r.author_id, AVG(r.rating_average) as rating
            FROM public.recipes r
            WHERE r.created_at >= NOW() - time_period
            GROUP BY r.author_id
        ) avg_rating ON p.id = avg_rating.author_id
        LEFT JOIN (
            SELECT r.author_id, SUM(r.rating_count) as ratings
            FROM public.recipes r
            WHERE r.created_at >= NOW() - time_period
            GROUP BY r.author_id
        ) rating_count ON p.id = rating_count.author_id
        LEFT JOIN (
            SELECT following_id, COUNT(*) as followers
            FROM public.user_follows
            GROUP BY following_id
        ) follower_count ON p.id = follower_count.following_id
        WHERE p.is_chef = TRUE
        ORDER BY performance_score DESC
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. USAGE EXAMPLES
-- =============================================

-- Example queries to use these monitoring functions:

-- Get overall database performance metrics
-- SELECT * FROM get_database_performance_metrics();

-- Check database health
-- SELECT * FROM check_database_health();

-- Get slow queries (requires pg_stat_statements extension)
-- SELECT * FROM get_slow_queries();

-- Get index usage statistics
-- SELECT * FROM get_index_usage_stats();

-- Get table statistics
-- SELECT * FROM get_table_statistics();

-- Perform maintenance
-- SELECT * FROM perform_database_maintenance();

-- Get platform growth metrics for last 30 days
-- SELECT * FROM get_platform_growth_metrics(30);

-- Get top performing recipes for last 7 days
-- SELECT * FROM get_top_performing_content('recipes', 10, '7 days');

-- Get top performing chefs for last 30 days
-- SELECT * FROM get_top_performing_content('chefs', 10, '30 days');

-- =============================================
-- 5. AUTOMATED MAINTENANCE SCHEDULE
-- =============================================

-- Create a function to run daily maintenance
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Update statistics for frequently updated tables
    ANALYZE public.recipe_views;
    ANALYZE public.recipe_interactions;
    ANALYZE public.recipe_ratings;
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes;
    REFRESH MATERIALIZED VIEW CONCURRENTLY chef_stats;
    
    -- Log maintenance completion
    INSERT INTO public.maintenance_log (operation, status, completed_at)
    VALUES ('Daily Maintenance', 'Completed', NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create maintenance log table
CREATE TABLE IF NOT EXISTS public.maintenance_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on maintenance log
CREATE INDEX IF NOT EXISTS idx_maintenance_log_completed_at ON public.maintenance_log(completed_at);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Database Monitoring and Maintenance Script Complete!';
    RAISE NOTICE 'Monitoring functions created:';
    RAISE NOTICE '- get_database_performance_metrics()';
    RAISE NOTICE '- check_database_health()';
    RAISE NOTICE '- get_slow_queries()';
    RAISE NOTICE '- get_index_usage_stats()';
    RAISE NOTICE '- get_table_statistics()';
    RAISE NOTICE '- perform_database_maintenance()';
    RAISE NOTICE '- get_platform_growth_metrics()';
    RAISE NOTICE '- get_top_performing_content()';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set up regular monitoring queries';
    RAISE NOTICE '2. Schedule daily maintenance tasks';
    RAISE NOTICE '3. Configure alerting for critical metrics';
    RAISE NOTICE '4. Monitor query performance and optimize as needed';
END $$;