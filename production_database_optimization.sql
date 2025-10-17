-- =============================================
-- PRODUCTION CHEF PLATFORM DATABASE OPTIMIZATION
-- =============================================
-- This script is designed for production use with existing data
-- Focus: Scalability, Performance, Minimal Dependencies
-- Safe for existing databases with data migration history

-- =============================================
-- 1. ESSENTIAL EXTENSIONS ONLY
-- =============================================
-- Only enable what we absolutely need for performance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- 2. CORE TABLES (Production-Ready Schema)
-- =============================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    website_url TEXT,
    is_chef BOOLEAN DEFAULT FALSE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    chef_specialties TEXT[],
    years_experience INTEGER DEFAULT 0 CHECK (years_experience >= 0),
    social_links JSONB DEFAULT '{}' NOT NULL,
    preferences JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories (hierarchical structure)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cuisines
CREATE TABLE IF NOT EXISTS public.cuisines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Dietary tags (normalized for performance)
CREATE TABLE IF NOT EXISTS public.dietary_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_allergen BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Main recipes table (optimized for queries)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time_minutes INTEGER CHECK (prep_time_minutes > 0),
    cook_time_minutes INTEGER CHECK (cook_time_minutes > 0),
    total_time_minutes INTEGER GENERATED ALWAYS AS (COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)) STORED,
    servings INTEGER DEFAULT 1 CHECK (servings > 0),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    cuisine_id UUID REFERENCES public.cuisines(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    video_url TEXT,
    nutrition_info JSONB DEFAULT '{}' NOT NULL,
    cooking_methods TEXT[],
    equipment_needed TEXT[],
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    rating_average DECIMAL(3,2) DEFAULT 0.00 NOT NULL,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- Recipe ingredients (normalized for search)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    ingredient_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,3) CHECK (amount > 0),
    unit VARCHAR(50),
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe dietary tags (many-to-many)
CREATE TABLE IF NOT EXISTS public.recipe_dietary_tags (
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    dietary_tag_id UUID REFERENCES public.dietary_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, dietary_tag_id)
);

-- Recipe ratings (with constraints)
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

-- Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    cover_image_url TEXT,
    recipe_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Collection recipes (junction table)
CREATE TABLE IF NOT EXISTS public.collection_recipes (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, recipe_id)
);

-- User saved recipes
CREATE TABLE IF NOT EXISTS public.saved_recipes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

-- User follows
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Recipe views (for analytics)
CREATE TABLE IF NOT EXISTS public.recipe_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe interactions
CREATE TABLE IF NOT EXISTS public.recipe_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'bookmark')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id, interaction_type)
);

-- =============================================
-- 3. PERFORMANCE INDEXES (Production-Optimized)
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_chef ON public.profiles(is_chef) WHERE is_chef = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- Recipe indexes (most critical for performance)
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
CREATE INDEX IF NOT EXISTS idx_recipes_servings ON public.recipes(servings);

-- Full-text search indexes (for search functionality)
CREATE INDEX IF NOT EXISTS idx_recipes_title_search ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_recipes_description_search ON public.recipes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_recipes_instructions_search ON public.recipes USING gin(to_tsvector('english', instructions));
CREATE INDEX IF NOT EXISTS idx_recipes_tags_search ON public.recipes USING gin(tags);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_recipes_published_featured ON public.recipes(is_published, is_featured) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_category_published ON public.recipes(category_id, is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_published ON public.recipes(cuisine_id, is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_author_published ON public.recipes(author_id, is_published) WHERE is_published = TRUE;

-- Other critical indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_name ON public.recipe_ingredients(ingredient_name);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON public.recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON public.recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_rating ON public.recipe_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_collections_author_id ON public.collections(author_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON public.collections(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_recipe_id ON public.recipe_views(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_user_id ON public.recipe_views(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_viewed_at ON public.recipe_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_recipe_id ON public.recipe_interactions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_user_id ON public.recipe_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_interactions_type ON public.recipe_interactions(interaction_type);

-- =============================================
-- 4. ESSENTIAL FUNCTIONS (Minimal Dependencies)
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update recipe rating statistics
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

-- Update collection recipe count
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
-- 5. ESSENTIAL TRIGGERS
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
-- 6. ROW LEVEL SECURITY (Production-Ready)
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
-- 7. RLS POLICIES (Minimal, Secure)
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
-- 8. UPDATE STATISTICS (Performance Optimization)
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

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Production Database Optimization Complete!';
    RAISE NOTICE 'Schema optimized for scalability and performance.';
    RAISE NOTICE 'Minimal dependencies - only essential extensions enabled.';
    RAISE NOTICE 'Ready for production use with existing data.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Monitor query performance';
    RAISE NOTICE '2. Set up automated maintenance';
    RAISE NOTICE '3. Configure monitoring and alerting';
    RAISE NOTICE '4. Scale resources based on usage patterns';
END $$;