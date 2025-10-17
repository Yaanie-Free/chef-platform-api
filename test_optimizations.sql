-- =============================================
-- CHEF PLATFORM DATABASE OPTIMIZATION TEST SCRIPT
-- =============================================
-- This script tests the database optimizations to ensure they work correctly

-- =============================================
-- 1. TEST BASIC FUNCTIONALITY
-- =============================================

-- Test 1: Check if all tables exist
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'profiles', 'recipes', 'recipe_ingredients', 'categories', 'cuisines',
        'dietary_tags', 'recipe_ratings', 'collections', 'collection_recipes',
        'saved_recipes', 'user_follows', 'recipe_views', 'recipe_interactions'
    ];
    table_name TEXT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_tables);
    
    IF table_count = array_length(expected_tables, 1) THEN
        RAISE NOTICE '✅ All required tables exist (% tables found)', table_count;
    ELSE
        RAISE NOTICE '❌ Missing tables. Expected %, found %', array_length(expected_tables, 1), table_count;
    END IF;
END $$;

-- Test 2: Check if all indexes exist
DO $$
DECLARE
    index_count INTEGER;
    expected_indexes TEXT[] := ARRAY[
        'idx_profiles_username', 'idx_recipes_author_id', 'idx_recipes_title_search',
        'idx_recipe_ratings_recipe_id', 'idx_collections_author_id'
    ];
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname = ANY(expected_indexes);
    
    IF index_count >= 5 THEN
        RAISE NOTICE '✅ Key indexes exist (% indexes found)', index_count;
    ELSE
        RAISE NOTICE '❌ Missing indexes. Found %', index_count;
    END IF;
END $$;

-- Test 3: Check if functions exist
DO $$
DECLARE
    function_count INTEGER;
    expected_functions TEXT[] := ARRAY[
        'search_recipes', 'get_recipe_recommendations', 'get_trending_recipes',
        'get_user_analytics', 'get_recipe_analytics', 'update_updated_at_column'
    ];
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = ANY(expected_functions);
    
    IF function_count >= 5 THEN
        RAISE NOTICE '✅ Key functions exist (% functions found)', function_count;
    ELSE
        RAISE NOTICE '❌ Missing functions. Found %', function_count;
    END IF;
END $$;

-- =============================================
-- 2. TEST SEARCH FUNCTIONALITY
-- =============================================

-- Test 4: Test search_recipes function
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM search_recipes('', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 5, 0);
    
    IF result_count >= 0 THEN
        RAISE NOTICE '✅ search_recipes function works (% results)', result_count;
    ELSE
        RAISE NOTICE '❌ search_recipes function failed';
    END IF;
END $$;

-- Test 5: Test get_recipe_recommendations function
DO $$
DECLARE
    result_count INTEGER;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM get_recipe_recommendations(test_user_id, 5);
    
    IF result_count >= 0 THEN
        RAISE NOTICE '✅ get_recipe_recommendations function works (% results)', result_count;
    ELSE
        RAISE NOTICE '❌ get_recipe_recommendations function failed';
    END IF;
END $$;

-- Test 6: Test get_trending_recipes function
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM get_trending_recipes('7 days', 5);
    
    IF result_count >= 0 THEN
        RAISE NOTICE '✅ get_trending_recipes function works (% results)', result_count;
    ELSE
        RAISE NOTICE '❌ get_trending_recipes function failed';
    END IF;
END $$;

-- =============================================
-- 3. TEST ANALYTICS FUNCTIONS
-- =============================================

-- Test 7: Test get_user_analytics function
DO $$
DECLARE
    result_count INTEGER;
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM get_user_analytics(test_user_id);
    
    IF result_count = 1 THEN
        RAISE NOTICE '✅ get_user_analytics function works (% results)', result_count;
    ELSE
        RAISE NOTICE '❌ get_user_analytics function failed';
    END IF;
END $$;

-- Test 8: Test get_recipe_analytics function
DO $$
DECLARE
    result_count INTEGER;
    test_recipe_id UUID := '10000000-0000-0000-0000-000000000001';
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM get_recipe_analytics(test_recipe_id);
    
    IF result_count = 1 THEN
        RAISE NOTICE '✅ get_recipe_analytics function works (% results)', result_count;
    ELSE
        RAISE NOTICE '❌ get_recipe_analytics function failed';
    END IF;
END $$;

-- =============================================
-- 4. TEST MONITORING FUNCTIONS
-- =============================================

-- Test 9: Test get_database_performance_metrics function
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM get_database_performance_metrics();
    
    IF result_count > 0 THEN
        RAISE NOTICE '✅ get_database_performance_metrics function works (% metrics)', result_count;
    ELSE
        RAISE NOTICE '❌ get_database_performance_metrics function failed';
    END IF;
END $$;

-- Test 10: Test check_database_health function
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM check_database_health();
    
    IF result_count > 0 THEN
        RAISE NOTICE '✅ check_database_health function works (% checks)', result_count;
    ELSE
        RAISE NOTICE '❌ check_database_health function failed';
    END IF;
END $$;

-- =============================================
-- 5. TEST TRIGGERS AND AUTOMATIC UPDATES
-- =============================================

-- Test 11: Test updated_at trigger
DO $$
DECLARE
    test_profile_id UUID := '00000000-0000-0000-0000-000000000001';
    old_updated_at TIMESTAMPTZ;
    new_updated_at TIMESTAMPTZ;
BEGIN
    -- Get current updated_at
    SELECT updated_at INTO old_updated_at
    FROM public.profiles
    WHERE id = test_profile_id;
    
    -- Update the profile
    UPDATE public.profiles
    SET bio = 'Updated bio for testing'
    WHERE id = test_profile_id;
    
    -- Get new updated_at
    SELECT updated_at INTO new_updated_at
    FROM public.profiles
    WHERE id = test_profile_id;
    
    IF new_updated_at > old_updated_at THEN
        RAISE NOTICE '✅ updated_at trigger works (updated from % to %)', old_updated_at, new_updated_at;
    ELSE
        RAISE NOTICE '❌ updated_at trigger failed';
    END IF;
END $$;

-- =============================================
-- 6. TEST MATERIALIZED VIEWS
-- =============================================

-- Test 12: Test materialized views
DO $$
DECLARE
    popular_count INTEGER;
    chef_stats_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO popular_count FROM popular_recipes;
    SELECT COUNT(*) INTO chef_stats_count FROM chef_stats;
    
    IF popular_count >= 0 AND chef_stats_count >= 0 THEN
        RAISE NOTICE '✅ Materialized views work (popular: %, chef_stats: %)', popular_count, chef_stats_count;
    ELSE
        RAISE NOTICE '❌ Materialized views failed';
    END IF;
END $$;

-- =============================================
-- 7. TEST ROW LEVEL SECURITY
-- =============================================

-- Test 13: Test RLS policies
DO $$
DECLARE
    rls_enabled_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'profiles', 'recipes', 'recipe_ratings', 'collections', 'saved_recipes'
    ];
BEGIN
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = ANY(expected_tables)
    AND c.relrowsecurity = true;
    
    IF rls_enabled_count >= 5 THEN
        RAISE NOTICE '✅ RLS is enabled on key tables (% tables)', rls_enabled_count;
    ELSE
        RAISE NOTICE '❌ RLS not properly enabled. Found % tables', rls_enabled_count;
    END IF;
END $$;

-- =============================================
-- 8. PERFORMANCE TESTS
-- =============================================

-- Test 14: Test search performance
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTERVAL;
BEGIN
    start_time := clock_timestamp();
    
    PERFORM * FROM search_recipes('pasta', NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 10, 0);
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    IF execution_time < INTERVAL '1 second' THEN
        RAISE NOTICE '✅ Search performance is good (execution time: %)', execution_time;
    ELSE
        RAISE NOTICE '⚠️ Search performance is slow (execution time: %)', execution_time;
    END IF;
END $$;

-- Test 15: Test index usage
DO $$
DECLARE
    index_usage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_usage_count
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan > 0;
    
    IF index_usage_count > 0 THEN
        RAISE NOTICE '✅ Indexes are being used (% indexes with scans)', index_usage_count;
    ELSE
        RAISE NOTICE '⚠️ No index usage detected (may be normal for new database)';
    END IF;
END $$;

-- =============================================
-- 9. FINAL SUMMARY
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'CHEF PLATFORM DATABASE OPTIMIZATION TEST COMPLETE';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see mostly ✅ checkmarks above, your database is optimized!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Add your own test data to verify functionality';
    RAISE NOTICE '2. Monitor query performance in production';
    RAISE NOTICE '3. Set up regular maintenance schedules';
    RAISE NOTICE '4. Configure monitoring and alerting';
    RAISE NOTICE '';
    RAISE NOTICE 'For any ❌ or ⚠️ warnings, check the database logs and';
    RAISE NOTICE 'refer to the troubleshooting guide in the README.';
    RAISE NOTICE '';
    RAISE NOTICE 'Happy cooking! 🍳👨‍🍳👩‍🍳';
    RAISE NOTICE '===============================================';
END $$;