-- =============================================
-- PRODUCTION MONITORING & MAINTENANCE SYSTEM
-- =============================================
-- Designed for production use with minimal dependencies
-- Focus: Performance monitoring, automated maintenance, scalability

-- =============================================
-- 1. MONITORING TABLES
-- =============================================

-- Performance metrics log
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Slow query log
CREATE TABLE IF NOT EXISTS public.slow_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query_text TEXT NOT NULL,
    execution_time_ms DECIMAL(10,2) NOT NULL,
    rows_examined BIGINT,
    rows_returned BIGINT,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Database health checks
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    check_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    message TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- 2. PERFORMANCE MONITORING FUNCTIONS
-- =============================================

-- Get database performance metrics
CREATE OR REPLACE FUNCTION get_database_performance_metrics()
RETURNS TABLE (
    metric_name TEXT,
    metric_value DECIMAL(15,4),
    metric_unit TEXT,
    recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.metric_name::TEXT,
        pm.metric_value,
        pm.metric_unit::TEXT,
        pm.recorded_at
    FROM public.performance_metrics pm
    WHERE pm.recorded_at >= NOW() - INTERVAL '24 hours'
    ORDER BY pm.recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(threshold_ms DECIMAL DEFAULT 1000)
RETURNS TABLE (
    query_text TEXT,
    execution_time_ms DECIMAL(10,2),
    rows_examined BIGINT,
    rows_returned BIGINT,
    recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sq.query_text,
        sq.execution_time_ms,
        sq.rows_examined,
        sq.rows_returned,
        sq.recorded_at
    FROM public.slow_queries sq
    WHERE sq.execution_time_ms >= threshold_ms
    ORDER BY sq.execution_time_ms DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size_mb DECIMAL(10,2),
    index_usage_count BIGINT,
    last_used TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.relname::TEXT as table_name,
        i.relname::TEXT as index_name,
        ROUND(pg_relation_size(i.oid) / 1024.0 / 1024.0, 2) as index_size_mb,
        COALESCE(s.idx_scan, 0) as index_usage_count,
        COALESCE(s.last_idx_scan, NULL) as last_used
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    LEFT JOIN pg_stat_user_indexes s ON s.indexrelid = i.oid
    WHERE t.relkind = 'r'
    AND t.relname IN ('profiles', 'recipes', 'recipe_ingredients', 'recipe_ratings', 'collections')
    ORDER BY index_size_mb DESC;
END;
$$ LANGUAGE plpgsql;

-- Get table statistics
CREATE OR REPLACE FUNCTION get_table_statistics()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size_mb DECIMAL(10,2),
    index_size_mb DECIMAL(10,2),
    total_size_mb DECIMAL(10,2),
    last_analyzed TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.relname::TEXT as table_name,
        COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0) as row_count,
        ROUND(pg_total_relation_size(t.oid) / 1024.0 / 1024.0, 2) as table_size_mb,
        ROUND(pg_indexes_size(t.oid) / 1024.0 / 1024.0, 2) as index_size_mb,
        ROUND(pg_total_relation_size(t.oid) / 1024.0 / 1024.0, 2) as total_size_mb,
        s.last_analyze as last_analyzed
    FROM pg_class t
    LEFT JOIN pg_stat_user_tables s ON s.relid = t.oid
    WHERE t.relkind = 'r'
    AND t.relname IN ('profiles', 'recipes', 'recipe_ingredients', 'recipe_ratings', 'collections')
    ORDER BY total_size_mb DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. HEALTH CHECK FUNCTIONS
-- =============================================

-- Check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    message TEXT,
    recorded_at TIMESTAMPTZ
) AS $$
DECLARE
    db_size_gb DECIMAL(10,2);
    active_connections INTEGER;
    max_connections INTEGER;
    cache_hit_ratio DECIMAL(5,2);
    slow_query_count INTEGER;
BEGIN
    -- Check database size
    SELECT ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0 / 1024.0, 2) INTO db_size_gb;
    
    IF db_size_gb > 10 THEN
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('database_size', 'warning', 'Database size is ' || db_size_gb || ' GB', '{"size_gb": ' || db_size_gb || '}');
    ELSE
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('database_size', 'healthy', 'Database size is ' || db_size_gb || ' GB', '{"size_gb": ' || db_size_gb || '}');
    END IF;
    
    -- Check active connections
    SELECT COUNT(*) INTO active_connections FROM pg_stat_activity WHERE state = 'active';
    SELECT setting::INTEGER INTO max_connections FROM pg_settings WHERE name = 'max_connections';
    
    IF active_connections > (max_connections * 0.8) THEN
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('active_connections', 'warning', 'Active connections: ' || active_connections || '/' || max_connections, '{"active": ' || active_connections || ', "max": ' || max_connections || '}');
    ELSE
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('active_connections', 'healthy', 'Active connections: ' || active_connections || '/' || max_connections, '{"active": ' || active_connections || ', "max": ' || max_connections || '}');
    END IF;
    
    -- Check cache hit ratio
    SELECT ROUND(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) INTO cache_hit_ratio
    FROM pg_stat_database WHERE datname = current_database();
    
    IF cache_hit_ratio < 90 THEN
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('cache_hit_ratio', 'warning', 'Cache hit ratio: ' || cache_hit_ratio || '%', '{"ratio": ' || cache_hit_ratio || '}');
    ELSE
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('cache_hit_ratio', 'healthy', 'Cache hit ratio: ' || cache_hit_ratio || '%', '{"ratio": ' || cache_hit_ratio || '}');
    END IF;
    
    -- Check for slow queries
    SELECT COUNT(*) INTO slow_query_count FROM public.slow_queries WHERE recorded_at >= NOW() - INTERVAL '1 hour';
    
    IF slow_query_count > 10 THEN
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('slow_queries', 'warning', 'Found ' || slow_query_count || ' slow queries in the last hour', '{"count": ' || slow_query_count || '}');
    ELSE
        INSERT INTO public.health_checks (check_name, status, message, metadata)
        VALUES ('slow_queries', 'healthy', 'Found ' || slow_query_count || ' slow queries in the last hour', '{"count": ' || slow_query_count || '}');
    END IF;
    
    -- Return recent health checks
    RETURN QUERY
    SELECT 
        hc.check_name::TEXT,
        hc.status::TEXT,
        hc.message::TEXT,
        hc.recorded_at
    FROM public.health_checks hc
    WHERE hc.recorded_at >= NOW() - INTERVAL '1 hour'
    ORDER BY hc.recorded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. MAINTENANCE FUNCTIONS
-- =============================================

-- Perform database maintenance
CREATE OR REPLACE FUNCTION perform_database_maintenance()
RETURNS TABLE (
    operation TEXT,
    status TEXT,
    message TEXT,
    executed_at TIMESTAMPTZ
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
    
    RETURN QUERY SELECT 'analyze_tables'::TEXT, 'completed'::TEXT, 'Updated table statistics'::TEXT, NOW()::TIMESTAMPTZ;
    
    -- Clean up old performance metrics (keep last 30 days)
    DELETE FROM public.performance_metrics WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    RETURN QUERY SELECT 'cleanup_metrics'::TEXT, 'completed'::TEXT, 'Cleaned up old performance metrics'::TEXT, NOW()::TIMESTAMPTZ;
    
    -- Clean up old slow queries (keep last 7 days)
    DELETE FROM public.slow_queries WHERE recorded_at < NOW() - INTERVAL '7 days';
    
    RETURN QUERY SELECT 'cleanup_slow_queries'::TEXT, 'completed'::TEXT, 'Cleaned up old slow queries'::TEXT, NOW()::TIMESTAMPTZ;
    
    -- Clean up old health checks (keep last 30 days)
    DELETE FROM public.health_checks WHERE recorded_at < NOW() - INTERVAL '30 days';
    
    RETURN QUERY SELECT 'cleanup_health_checks'::TEXT, 'completed'::TEXT, 'Cleaned up old health checks'::TEXT, NOW()::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. SCALABILITY FUNCTIONS
-- =============================================

-- Get platform growth metrics
CREATE OR REPLACE FUNCTION get_platform_growth_metrics()
RETURNS TABLE (
    metric_name TEXT,
    current_value BIGINT,
    previous_value BIGINT,
    growth_percentage DECIMAL(5,2),
    recorded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            'total_users'::TEXT as metric_name,
            COUNT(*)::BIGINT as current_value,
            NOW()::TIMESTAMPTZ as recorded_at
        FROM public.profiles
        UNION ALL
        SELECT 
            'total_recipes'::TEXT as metric_name,
            COUNT(*)::BIGINT as current_value,
            NOW()::TIMESTAMPTZ as recorded_at
        FROM public.recipes
        WHERE is_published = TRUE
        UNION ALL
        SELECT 
            'total_views'::TEXT as metric_name,
            SUM(view_count)::BIGINT as current_value,
            NOW()::TIMESTAMPTZ as recorded_at
        FROM public.recipes
        UNION ALL
        SELECT 
            'total_ratings'::TEXT as metric_name,
            COUNT(*)::BIGINT as current_value,
            NOW()::TIMESTAMPTZ as recorded_at
        FROM public.recipe_ratings
    ),
    previous_metrics AS (
        SELECT 
            'total_users'::TEXT as metric_name,
            COUNT(*)::BIGINT as previous_value
        FROM public.profiles
        WHERE created_at < NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT 
            'total_recipes'::TEXT as metric_name,
            COUNT(*)::BIGINT as previous_value
        FROM public.recipes
        WHERE is_published = TRUE AND created_at < NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT 
            'total_views'::TEXT as metric_name,
            SUM(view_count)::BIGINT as previous_value
        FROM public.recipes
        WHERE created_at < NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT 
            'total_ratings'::TEXT as metric_name,
            COUNT(*)::BIGINT as previous_value
        FROM public.recipe_ratings
        WHERE created_at < NOW() - INTERVAL '30 days'
    )
    SELECT 
        cm.metric_name,
        cm.current_value,
        COALESCE(pm.previous_value, 0) as previous_value,
        CASE 
            WHEN COALESCE(pm.previous_value, 0) = 0 THEN 0.00
            ELSE ROUND(((cm.current_value - COALESCE(pm.previous_value, 0))::DECIMAL / COALESCE(pm.previous_value, 1)) * 100, 2)
        END as growth_percentage,
        cm.recorded_at
    FROM current_metrics cm
    LEFT JOIN previous_metrics pm ON cm.metric_name = pm.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Get top performing content
CREATE OR REPLACE FUNCTION get_top_performing_content(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    content_type TEXT,
    content_id UUID,
    content_title TEXT,
    performance_score DECIMAL(10,2),
    view_count BIGINT,
    rating_average DECIMAL(3,2),
    rating_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'recipe'::TEXT as content_type,
        r.id as content_id,
        r.title as content_title,
        (r.view_count * 0.7 + r.rating_average * r.rating_count * 0.3)::DECIMAL(10,2) as performance_score,
        r.view_count,
        r.rating_average,
        r.rating_count,
        r.created_at
    FROM public.recipes r
    WHERE r.is_published = TRUE
    ORDER BY performance_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. AUTOMATED MAINTENANCE SCHEDULE
-- =============================================

-- Daily maintenance function
CREATE OR REPLACE FUNCTION run_daily_maintenance()
RETURNS TABLE (
    operation TEXT,
    status TEXT,
    message TEXT,
    executed_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Run health checks
    PERFORM check_database_health();
    
    -- Run maintenance
    RETURN QUERY SELECT * FROM perform_database_maintenance();
    
    -- Log maintenance completion
    INSERT INTO public.performance_metrics (metric_name, metric_value, metric_unit, metadata)
    VALUES ('maintenance_completed', 1, 'count', '{"type": "daily", "timestamp": "' || NOW()::TEXT || '"}');
    
    RETURN QUERY SELECT 'daily_maintenance'::TEXT, 'completed'::TEXT, 'Daily maintenance completed successfully'::TEXT, NOW()::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. INDEXES FOR MONITORING TABLES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON public.performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_slow_queries_recorded_at ON public.slow_queries(recorded_at);
CREATE INDEX IF NOT EXISTS idx_slow_queries_execution_time ON public.slow_queries(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_health_checks_recorded_at ON public.health_checks(recorded_at);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks(status);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Production Monitoring System Installed!';
    RAISE NOTICE 'Monitoring tables and functions created.';
    RAISE NOTICE 'Ready for production monitoring and maintenance.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set up automated maintenance schedule';
    RAISE NOTICE '2. Configure monitoring dashboards';
    RAISE NOTICE '3. Set up alerting for critical metrics';
    RAISE NOTICE '4. Monitor performance and scale as needed';
END $$;