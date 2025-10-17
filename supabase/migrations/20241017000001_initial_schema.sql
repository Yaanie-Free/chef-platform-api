-- Chef Platform Database Schema
-- Optimized for performance, scalability, and data integrity

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- USER MANAGEMENT & PROFILES
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
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
CREATE TABLE public.chef_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chef_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    verification_type VARCHAR(50) NOT NULL, -- 'certification', 'experience', 'portfolio'
    verification_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RECIPE MANAGEMENT
-- =============================================

-- Categories table
CREATE TABLE public.categories (
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
CREATE TABLE public.cuisines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Dietary restrictions/allergens
CREATE TABLE public.dietary_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_allergen BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Main recipes table
CREATE TABLE public.recipes (
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
CREATE TABLE public.recipe_ingredients (
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
CREATE TABLE public.recipe_dietary_tags (
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    dietary_tag_id UUID REFERENCES public.dietary_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, dietary_tag_id)
);

-- Recipe images table
CREATE TABLE public.recipe_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- RATINGS & REVIEWS
-- =============================================

-- Recipe ratings table
CREATE TABLE public.recipe_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id)
);

-- =============================================
-- COLLECTIONS & SAVED RECIPES
-- =============================================

-- Recipe collections (cookbooks, meal plans, etc.)
CREATE TABLE public.collections (
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
CREATE TABLE public.collection_recipes (
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (collection_id, recipe_id)
);

-- User saved recipes (favorites)
CREATE TABLE public.saved_recipes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

-- =============================================
-- FOLLOW SYSTEM
-- =============================================

-- User follows table
CREATE TABLE public.user_follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- =============================================
-- ANALYTICS & ENGAGEMENT
-- =============================================

-- Recipe views tracking
CREATE TABLE public.recipe_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recipe interactions (likes, shares, etc.)
CREATE TABLE public.recipe_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'bookmark')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, user_id, interaction_type)
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_is_chef ON public.profiles(is_chef) WHERE is_chef = TRUE;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- Recipe indexes for performance
CREATE INDEX idx_recipes_author_id ON public.recipes(author_id);
CREATE INDEX idx_recipes_category_id ON public.recipes(category_id);
CREATE INDEX idx_recipes_cuisine_id ON public.recipes(cuisine_id);
CREATE INDEX idx_recipes_is_published ON public.recipes(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_recipes_is_featured ON public.recipes(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_recipes_created_at ON public.recipes(created_at);
CREATE INDEX idx_recipes_updated_at ON public.recipes(updated_at);
CREATE INDEX idx_recipes_published_at ON public.recipes(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_recipes_rating_average ON public.recipes(rating_average);
CREATE INDEX idx_recipes_view_count ON public.recipes(view_count);
CREATE INDEX idx_recipes_difficulty_level ON public.recipes(difficulty_level);
CREATE INDEX idx_recipes_total_time ON public.recipes(total_time_minutes);

-- Full-text search indexes
CREATE INDEX idx_recipes_title_search ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_recipes_description_search ON public.recipes USING gin(to_tsvector('english', description));
CREATE INDEX idx_recipes_instructions_search ON public.recipes USING gin(to_tsvector('english', instructions));
CREATE INDEX idx_recipes_tags_search ON public.recipes USING gin(tags);

-- Recipe ingredients indexes
CREATE INDEX idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_name ON public.recipe_ingredients(ingredient_name);
CREATE INDEX idx_recipe_ingredients_sort_order ON public.recipe_ingredients(recipe_id, sort_order);

-- Rating indexes
CREATE INDEX idx_recipe_ratings_recipe_id ON public.recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_user_id ON public.recipe_ratings(user_id);
CREATE INDEX idx_recipe_ratings_rating ON public.recipe_ratings(rating);
CREATE INDEX idx_recipe_ratings_created_at ON public.recipe_ratings(created_at);

-- Collection indexes
CREATE INDEX idx_collections_author_id ON public.collections(author_id);
CREATE INDEX idx_collections_is_public ON public.collections(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_collections_is_featured ON public.collections(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_collections_created_at ON public.collections(created_at);

-- Follow system indexes
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);

-- Analytics indexes
CREATE INDEX idx_recipe_views_recipe_id ON public.recipe_views(recipe_id);
CREATE INDEX idx_recipe_views_user_id ON public.recipe_views(user_id);
CREATE INDEX idx_recipe_views_viewed_at ON public.recipe_views(viewed_at);
CREATE INDEX idx_recipe_interactions_recipe_id ON public.recipe_interactions(recipe_id);
CREATE INDEX idx_recipe_interactions_user_id ON public.recipe_interactions(user_id);
CREATE INDEX idx_recipe_interactions_type ON public.recipe_interactions(interaction_type);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_ratings_updated_at BEFORE UPDATE ON public.recipe_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Apply rating update triggers
CREATE TRIGGER update_recipe_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ratings
    FOR EACH ROW EXECUTE FUNCTION update_recipe_rating_stats();

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

-- Apply collection count update triggers
CREATE TRIGGER update_collection_recipe_count_trigger
    AFTER INSERT OR DELETE ON public.collection_recipes
    FOR EACH ROW EXECUTE FUNCTION update_collection_recipe_count();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Published recipes are viewable by everyone" ON public.recipes FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can insert their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe ratings policies
CREATE POLICY "Anyone can view recipe ratings" ON public.recipe_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ratings" ON public.recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON public.recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "Public collections are viewable by everyone" ON public.collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own collections" ON public.collections FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can insert their own collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own collections" ON public.collections FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own collections" ON public.collections FOR DELETE USING (auth.uid() = author_id);

-- Saved recipes policies
CREATE POLICY "Users can view their own saved recipes" ON public.saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved recipes" ON public.saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved recipes" ON public.saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can insert their own follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Recipe interactions policies
CREATE POLICY "Anyone can view recipe interactions" ON public.recipe_interactions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own interactions" ON public.recipe_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.recipe_interactions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA FOR TESTING
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
('Snacks', 'snacks', 'Light food items between meals');

-- Insert sample cuisines
INSERT INTO public.cuisines (name, slug, description, region) VALUES
('Italian', 'italian', 'Traditional Italian cuisine', 'Italy'),
('Mexican', 'mexican', 'Traditional Mexican cuisine', 'Mexico'),
('Asian', 'asian', 'Various Asian cuisines', 'Asia'),
('American', 'american', 'Traditional American cuisine', 'United States'),
('French', 'french', 'Traditional French cuisine', 'France'),
('Indian', 'indian', 'Traditional Indian cuisine', 'India'),
('Mediterranean', 'mediterranean', 'Mediterranean region cuisine', 'Mediterranean'),
('Thai', 'thai', 'Traditional Thai cuisine', 'Thailand');

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
('Kosher', 'kosher', 'Kosher certified', false);