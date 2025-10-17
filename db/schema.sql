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

-- End of schema
