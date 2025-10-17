-- Seed data for Chef Platform Database
-- This file contains sample data for testing and development

-- =============================================
-- SAMPLE USERS (Note: These will be created via auth.users)
-- =============================================

-- Insert sample profiles (assuming auth.users exist)
-- In a real scenario, these would be created through the auth system
INSERT INTO public.profiles (id, username, display_name, bio, is_chef, is_verified, chef_specialties, years_experience, location) VALUES
('00000000-0000-0000-0000-000000000001', 'chef_maria', 'Maria Rodriguez', 'Professional chef specializing in Mexican and Latin American cuisine. 15+ years of experience in fine dining.', true, true, ARRAY['Mexican', 'Latin American', 'Fine Dining'], 15, 'Los Angeles, CA'),
('00000000-0000-0000-0000-000000000002', 'chef_james', 'James Chen', 'Asian fusion expert with a passion for modern techniques and traditional flavors.', true, true, ARRAY['Asian Fusion', 'Modern Techniques', 'Sushi'], 12, 'San Francisco, CA'),
('00000000-0000-0000-0000-000000000003', 'chef_sophie', 'Sophie Laurent', 'French pastry chef and cooking instructor. Love sharing the art of French cuisine.', true, true, ARRAY['French Pastry', 'Baking', 'Cooking Education'], 8, 'New York, NY'),
('00000000-0000-0000-0000-000000000004', 'home_cook_sarah', 'Sarah Johnson', 'Home cook passionate about healthy, family-friendly meals.', false, false, ARRAY['Healthy Cooking', 'Family Meals'], 5, 'Austin, TX'),
('00000000-0000-0000-0000-000000000005', 'chef_antonio', 'Antonio Rossi', 'Italian chef bringing authentic flavors from the old country.', true, true, ARRAY['Italian', 'Pasta', 'Traditional Italian'], 20, 'Chicago, IL');

-- =============================================
-- SAMPLE RECIPES
-- =============================================

-- Get category and cuisine IDs for reference
DO $$
DECLARE
    appetizer_id UUID;
    main_course_id UUID;
    dessert_id UUID;
    breakfast_id UUID;
    italian_id UUID;
    mexican_id UUID;
    asian_id UUID;
    american_id UUID;
    french_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO appetizer_id FROM public.categories WHERE slug = 'appetizers';
    SELECT id INTO main_course_id FROM public.categories WHERE slug = 'main-courses';
    SELECT id INTO dessert_id FROM public.categories WHERE slug = 'desserts';
    SELECT id INTO breakfast_id FROM public.categories WHERE slug = 'breakfast';
    
    -- Get cuisine IDs
    SELECT id INTO italian_id FROM public.cuisines WHERE slug = 'italian';
    SELECT id INTO mexican_id FROM public.cuisines WHERE slug = 'mexican';
    SELECT id INTO asian_id FROM public.cuisines WHERE slug = 'asian';
    SELECT id INTO american_id FROM public.cuisines WHERE slug = 'american';
    SELECT id INTO french_id FROM public.cuisines WHERE slug = 'french';

    -- Insert sample recipes
    INSERT INTO public.recipes (id, title, slug, description, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty_level, author_id, category_id, cuisine_id, featured_image_url, tags, is_published, published_at) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Authentic Guacamole', 'authentic-guacamole', 'The perfect guacamole recipe with fresh ingredients and traditional techniques.', '1. Cut avocados in half and remove pits. Scoop flesh into a bowl.
2. Add lime juice and salt, then mash with a fork to desired consistency.
3. Fold in diced tomatoes, onions, and cilantro.
4. Add minced jalapeño and garlic.
5. Taste and adjust seasoning.
6. Serve immediately with tortilla chips.', 15, 0, 6, 1, '00000000-0000-0000-0000-000000000001', appetizer_id, mexican_id, 'https://example.com/guacamole.jpg', ARRAY['appetizer', 'mexican', 'vegetarian', 'quick'], true, NOW() - INTERVAL '5 days'),
    
    ('10000000-0000-0000-0000-000000000002', 'Spicy Thai Basil Chicken', 'spicy-thai-basil-chicken', 'Aromatic Thai dish with fresh basil, chilies, and tender chicken.', '1. Heat oil in a wok over high heat.
2. Add garlic and chilies, stir-fry for 30 seconds.
3. Add ground chicken and cook until no longer pink.
4. Add fish sauce, soy sauce, and sugar.
5. Add fresh basil leaves and stir until wilted.
6. Serve over jasmine rice.', 10, 10, 4, 3, '00000000-0000-0000-0000-000000000002', main_course_id, asian_id, 'https://example.com/thai-chicken.jpg', ARRAY['thai', 'spicy', 'chicken', 'stir-fry'], true, NOW() - INTERVAL '3 days'),
    
    ('10000000-0000-0000-0000-000000000003', 'Classic French Macarons', 'classic-french-macarons', 'Delicate almond cookies with a smooth ganache filling.', '1. Sift almond flour and powdered sugar together.
2. Beat egg whites with cream of tartar until foamy.
3. Gradually add granulated sugar and beat to stiff peaks.
4. Fold in dry ingredients in three additions.
5. Pipe onto parchment-lined baking sheets.
6. Let rest for 30 minutes, then bake at 300°F for 15 minutes.
7. Cool completely before filling with ganache.', 45, 15, 24, 5, '00000000-0000-0000-0000-000000000003', dessert_id, french_id, 'https://example.com/macarons.jpg', ARRAY['french', 'dessert', 'baking', 'macarons'], true, NOW() - INTERVAL '1 day'),
    
    ('10000000-0000-0000-0000-000000000004', 'Fluffy Pancakes', 'fluffy-pancakes', 'Light and airy pancakes perfect for weekend breakfast.', '1. Mix dry ingredients in a large bowl.
2. Whisk wet ingredients in another bowl.
3. Pour wet ingredients into dry and stir until just combined.
4. Heat griddle over medium heat.
5. Pour 1/4 cup batter for each pancake.
6. Cook until bubbles form and edges look set.
7. Flip and cook until golden brown.', 10, 15, 4, 2, '00000000-0000-0000-0000-000000000004', breakfast_id, american_id, 'https://example.com/pancakes.jpg', ARRAY['breakfast', 'pancakes', 'american', 'easy'], true, NOW() - INTERVAL '2 days'),
    
    ('10000000-0000-0000-0000-000000000005', 'Homemade Pasta Carbonara', 'homemade-pasta-carbonara', 'Creamy Italian pasta with eggs, cheese, and pancetta.', '1. Cook pasta according to package directions.
2. Cook pancetta in a large skillet until crispy.
3. Whisk eggs and cheese together in a bowl.
4. Add hot pasta to pancetta with some pasta water.
5. Remove from heat and quickly stir in egg mixture.
6. Toss until creamy and well combined.
7. Serve immediately with black pepper.', 20, 15, 4, 4, '00000000-0000-0000-0000-000000000005', main_course_id, italian_id, 'https://example.com/carbonara.jpg', ARRAY['italian', 'pasta', 'carbonara', 'comfort-food'], true, NOW() - INTERVAL '4 days');

    -- Insert recipe ingredients
    INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, amount, unit, notes, sort_order) VALUES
    -- Guacamole ingredients
    ('10000000-0000-0000-0000-000000000001', 'Ripe avocados', 4, 'pieces', 'Hass avocados work best', 1),
    ('10000000-0000-0000-0000-000000000001', 'Lime juice', 2, 'tbsp', 'Fresh squeezed', 2),
    ('10000000-0000-0000-0000-000000000001', 'Salt', 0.5, 'tsp', 'To taste', 3),
    ('10000000-0000-0000-0000-000000000001', 'Diced tomatoes', 0.5, 'cup', 'Roma tomatoes preferred', 4),
    ('10000000-0000-0000-0000-000000000001', 'Diced red onion', 0.25, 'cup', 'Finely diced', 5),
    ('10000000-0000-0000-0000-000000000001', 'Fresh cilantro', 2, 'tbsp', 'Chopped', 6),
    ('10000000-0000-0000-0000-000000000001', 'Jalapeño pepper', 1, 'piece', 'Minced, seeds removed', 7),
    ('10000000-0000-0000-0000-000000000001', 'Garlic', 1, 'clove', 'Minced', 8),
    
    -- Thai Basil Chicken ingredients
    ('10000000-0000-0000-0000-000000000002', 'Ground chicken', 1, 'lb', 'Ground chicken thigh preferred', 1),
    ('10000000-0000-0000-0000-000000000002', 'Thai basil leaves', 1, 'cup', 'Fresh, packed', 2),
    ('10000000-0000-0000-0000-000000000002', 'Garlic', 4, 'cloves', 'Minced', 3),
    ('10000000-0000-0000-0000-000000000002', 'Thai chilies', 3, 'pieces', 'Sliced', 4),
    ('10000000-0000-0000-0000-000000000002', 'Fish sauce', 2, 'tbsp', 'Thai fish sauce', 5),
    ('10000000-0000-0000-0000-000000000002', 'Soy sauce', 1, 'tbsp', 'Light soy sauce', 6),
    ('10000000-0000-0000-0000-000000000002', 'Sugar', 1, 'tsp', 'Palm sugar preferred', 7),
    ('10000000-0000-0000-0000-000000000002', 'Vegetable oil', 2, 'tbsp', 'For stir-frying', 8),
    
    -- Macarons ingredients
    ('10000000-0000-0000-0000-000000000003', 'Almond flour', 1, 'cup', 'Finely ground', 1),
    ('10000000-0000-0000-0000-000000000003', 'Powdered sugar', 1.75, 'cups', 'Sifted', 2),
    ('10000000-0000-0000-0000-000000000003', 'Egg whites', 3, 'large', 'Room temperature', 3),
    ('10000000-0000-0000-0000-000000000003', 'Granulated sugar', 0.25, 'cup', 'For meringue', 4),
    ('10000000-0000-0000-0000-000000000003', 'Cream of tartar', 0.25, 'tsp', 'For stability', 5),
    ('10000000-0000-0000-0000-000000000003', 'Food coloring', 2, 'drops', 'Optional', 6),
    
    -- Pancakes ingredients
    ('10000000-0000-0000-0000-000000000004', 'All-purpose flour', 1.5, 'cups', 'Sifted', 1),
    ('10000000-0000-0000-0000-000000000004', 'Sugar', 2, 'tbsp', 'Granulated', 2),
    ('10000000-0000-0000-0000-000000000004', 'Baking powder', 2, 'tsp', 'Fresh', 3),
    ('10000000-0000-0000-0000-000000000004', 'Salt', 0.5, 'tsp', 'Fine sea salt', 4),
    ('10000000-0000-0000-0000-000000000004', 'Milk', 1.25, 'cups', 'Whole milk preferred', 5),
    ('10000000-0000-0000-0000-000000000004', 'Egg', 1, 'large', 'Room temperature', 6),
    ('10000000-0000-0000-0000-000000000004', 'Butter', 3, 'tbsp', 'Melted and cooled', 7),
    ('10000000-0000-0000-0000-000000000004', 'Vanilla extract', 1, 'tsp', 'Pure vanilla', 8),
    
    -- Carbonara ingredients
    ('10000000-0000-0000-0000-000000000005', 'Spaghetti', 1, 'lb', 'Fresh pasta preferred', 1),
    ('10000000-0000-0000-0000-000000000005', 'Pancetta', 6, 'oz', 'Diced', 2),
    ('10000000-0000-0000-0000-000000000005', 'Eggs', 4, 'large', 'Room temperature', 3),
    ('10000000-0000-0000-0000-000000000005', 'Pecorino Romano', 1, 'cup', 'Freshly grated', 4),
    ('10000000-0000-0000-0000-000000000005', 'Black pepper', 1, 'tsp', 'Freshly ground', 5),
    ('10000000-0000-0000-0000-000000000005', 'Salt', 1, 'tsp', 'For pasta water', 6);

    -- Insert sample ratings
    INSERT INTO public.recipe_ratings (recipe_id, user_id, rating, review) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5, 'Perfect guacamole! Just like my grandmother used to make.'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 4, 'Great recipe, I added a bit more lime juice.'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 5, 'So fresh and delicious!'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 5, 'Authentic Thai flavors, absolutely amazing!'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 4, 'Spicy but perfect balance of flavors.'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 5, 'My new favorite Thai dish!'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 5, 'These macarons are restaurant quality!'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 4, 'Challenging but worth the effort.'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 5, 'Beautiful and delicious!'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 4, 'Perfect weekend breakfast!'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 5, 'So fluffy and light!'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 4, 'Kids loved them!'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 5, 'Authentic Italian carbonara!'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 4, 'Creamy and delicious.'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 5, 'Restaurant quality at home!');

    -- Insert sample collections
    INSERT INTO public.collections (id, name, description, author_id, is_public, is_featured) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Quick Weeknight Dinners', 'Fast and easy recipes for busy weeknights', '00000000-0000-0000-0000-000000000004', true, false),
    ('20000000-0000-0000-0000-000000000002', 'Mexican Favorites', 'Authentic Mexican recipes from my kitchen', '00000000-0000-0000-0000-000000000001', true, true),
    ('20000000-0000-0000-0000-000000000003', 'French Pastry Collection', 'Classic French pastries and desserts', '00000000-0000-0000-0000-000000000003', true, true),
    ('20000000-0000-0000-0000-000000000004', 'Asian Fusion', 'Modern Asian dishes with a twist', '00000000-0000-0000-0000-000000000002', true, false),
    ('20000000-0000-0000-0000-000000000005', 'Family Breakfast Ideas', 'Kid-friendly breakfast recipes', '00000000-0000-0000-0000-000000000004', true, false);

    -- Insert collection recipes
    INSERT INTO public.collection_recipes (collection_id, recipe_id, sort_order) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2),
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 3),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 1),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 1);

    -- Insert sample saved recipes
    INSERT INTO public.saved_recipes (user_id, recipe_id) VALUES
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005'),
    ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005'),
    ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005');

    -- Insert sample user follows
    INSERT INTO public.user_follows (follower_id, following_id) VALUES
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004'),
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004');

    -- Insert sample recipe interactions
    INSERT INTO public.recipe_interactions (recipe_id, user_id, interaction_type) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'like'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'like'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'like'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'like'),
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'share'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'like'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'like'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'like'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'like'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'like'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'like'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'like'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'like'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'like'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'like'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'like'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'like');

    -- Update recipe view counts (simulate some views)
    UPDATE public.recipes SET view_count = FLOOR(RANDOM() * 1000) + 100 WHERE id IN (
        '10000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000005'
    );

    -- Update collection recipe counts
    UPDATE public.collections SET recipe_count = (
        SELECT COUNT(*) FROM public.collection_recipes 
        WHERE collection_id = collections.id
    );

END $$;