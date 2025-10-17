-- Complete Database Schema for Private Chef Platform
-- This should be run in your Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type AS ENUM ('customer', 'chef');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
CREATE TYPE chat_status AS ENUM ('active', 'archived', 'blocked');
CREATE TYPE message_sender_type AS ENUM ('customer', 'chef', 'system');

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cell_number VARCHAR(20) NOT NULL,
    location JSONB NOT NULL, -- {city, suburb, street, postal_code}
    dietary_requirements TEXT[] DEFAULT '{}',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chefs table
CREATE TABLE chefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cell_number VARCHAR(20) NOT NULL,
    work_history TEXT NOT NULL,
    bio TEXT NOT NULL,
    regions_served TEXT[] NOT NULL DEFAULT '{}',
    max_travel_distance INTEGER NOT NULL DEFAULT 0,
    dietary_specialties TEXT[] NOT NULL DEFAULT '{}',
    holiday_rate_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5,
    base_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    profile_images JSONB DEFAULT '[]', -- Array of image objects
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 50),
    dietary_requirements TEXT[] DEFAULT '{}',
    customer_supplies_tools BOOLEAN DEFAULT false,
    event_location JSONB NOT NULL, -- {street, suburb, city, postal_code}
    special_requests TEXT DEFAULT '',
    menu_preferences JSONB DEFAULT '{}', -- {course_type, cuisine_type, drink_pairings}
    subtotal DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    payment_processing_fee DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    google_maps_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    status chat_status DEFAULT 'active',
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- Can be customer or chef ID
    sender_type message_sender_type NOT NULL,
    message TEXT NOT NULL,
    is_automated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, chef_id) -- One review per customer per chef
);

-- Chef posts table
CREATE TABLE chef_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]', -- Array of image objects
    location TEXT,
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dietary options lookup table
CREATE TABLE dietary_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cuisine categories lookup table
CREATE TABLE cuisine_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Can be customer or chef ID
    user_type user_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'booking', 'message', 'review', etc.
    reference_id UUID, -- ID of related booking, message, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    chef_id UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'cancelled'
    service_fee DECIMAL(10,2) NOT NULL,
    payment_processing_fee DECIMAL(10,2) NOT NULL,
    chef_payout DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_chefs_email ON chefs(email);
CREATE INDEX idx_chefs_regions_served ON chefs USING GIN(regions_served);
CREATE INDEX idx_chefs_dietary_specialties ON chefs USING GIN(dietary_specialties);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_chef_id ON bookings(chef_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_chats_customer_id ON chats(customer_id);
CREATE INDEX idx_chats_chef_id ON chats(chef_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_reviews_chef_id ON reviews(chef_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_chef_posts_chef_id ON chef_posts(chef_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chefs_updated_at BEFORE UPDATE ON chefs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chef_posts_updated_at BEFORE UPDATE ON chef_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample dietary options
INSERT INTO dietary_options (name, description) VALUES
('Vegetarian', 'No meat or fish'),
('Vegan', 'No animal products'),
('Gluten-free', 'No gluten-containing ingredients'),
('Dairy-free', 'No dairy products'),
('Nut-free', 'No nuts or nut products'),
('Halaal', 'Prepared according to Islamic dietary laws'),
('Kosher', 'Prepared according to Jewish dietary laws'),
('Paleo', 'Paleolithic diet'),
('Keto', 'Ketogenic diet'),
('Low-carb', 'Reduced carbohydrate intake');

-- Insert sample cuisine categories
INSERT INTO cuisine_categories (name, description) VALUES
('Italian', 'Traditional Italian cuisine'),
('French', 'Classic French cooking'),
('Asian', 'Various Asian cuisines'),
('Mediterranean', 'Mediterranean region cuisine'),
('South African', 'Traditional South African dishes'),
('Indian', 'Indian subcontinent cuisine'),
('Mexican', 'Mexican and Tex-Mex cuisine'),
('Japanese', 'Traditional Japanese cuisine'),
('Thai', 'Thai cuisine'),
('Chinese', 'Chinese cuisine');

-- Create RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "Customers can view own data" ON customers
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can update own data" ON customers
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Chefs can only see their own data
CREATE POLICY "Chefs can view own data" ON chefs
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Chefs can update own data" ON chefs
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Bookings are visible to both customer and chef
CREATE POLICY "Bookings visible to participants" ON bookings
    FOR SELECT USING (
        auth.uid()::text = customer_id::text OR 
        auth.uid()::text = chef_id::text
    );

-- Chats are visible to participants
CREATE POLICY "Chats visible to participants" ON chats
    FOR SELECT USING (
        auth.uid()::text = customer_id::text OR 
        auth.uid()::text = chef_id::text
    );

-- Messages are visible to chat participants
CREATE POLICY "Messages visible to chat participants" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.customer_id::text = auth.uid()::text OR chats.chef_id::text = auth.uid()::text)
        )
    );

-- Reviews are publicly visible
CREATE POLICY "Reviews are publicly visible" ON reviews
    FOR SELECT USING (true);

-- Chef posts are publicly visible
CREATE POLICY "Chef posts are publicly visible" ON chef_posts
    FOR SELECT USING (true);

-- Notifications are visible to the user
CREATE POLICY "Notifications visible to user" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Payment transactions are visible to participants
CREATE POLICY "Payment transactions visible to participants" ON payment_transactions
    FOR SELECT USING (
        auth.uid()::text = customer_id::text OR 
        auth.uid()::text = chef_id::text
    );