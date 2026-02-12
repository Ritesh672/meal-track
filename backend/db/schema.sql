-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE
-- Handles authentication and basic user info
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ================================================
-- USER PROFILES TABLE
-- Extended user information after initial login
-- ================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm DECIMAL(10,2),
    current_weight_kg DECIMAL(10,2),
    fitness_level VARCHAR(20) NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ================================================
-- FITNESS GOALS TABLE
-- User's fitness objectives and target physique
-- ================================================
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'maintenance', 'body_recomposition', 'athletic_performance')),
    target_physique VARCHAR(50) CHECK (target_physique IN ('lean', 'athletic', 'muscular', 'bulky', 'toned')),
    target_weight_kg DECIMAL(5,2),
    target_date DATE,
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_active ON fitness_goals(user_id, is_active);

-- ================================================
-- NUTRITION TARGETS TABLE
-- AI-generated daily nutrition requirements
-- Generated using Gemini API based on user goals
-- ================================================
CREATE TABLE IF NOT EXISTS nutrition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES fitness_goals(id) ON DELETE SET NULL,
    daily_calories INTEGER NOT NULL,
    daily_protein_g DECIMAL(6,2) NOT NULL,
    daily_carbs_g DECIMAL(6,2) NOT NULL,
    daily_fats_g DECIMAL(6,2) NOT NULL,
    daily_fiber_g DECIMAL(6,2),
    daily_water_ml INTEGER,
    calculation_method VARCHAR(50) DEFAULT 'gemini_api',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nutrition_targets_user_id ON nutrition_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_targets_active ON nutrition_targets(user_id, is_active);

-- ================================================
-- MEALS TABLE
-- Individual meal entries (text or image input)
-- ================================================
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_time TIME NOT NULL DEFAULT CURRENT_TIME,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other')),
    meal_name VARCHAR(255),
    description TEXT,
    input_type VARCHAR(10) NOT NULL CHECK (input_type IN ('text', 'image')),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_meals_date_time ON meals(user_id, meal_date, meal_time);

-- ================================================
-- MEAL NUTRITION TABLE
-- Nutrition content for each meal (calculated by Gemini API)
-- ================================================
CREATE TABLE IF NOT EXISTS meal_nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID UNIQUE NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    calories INTEGER NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL,
    carbs_g DECIMAL(6,2) NOT NULL,
    fats_g DECIMAL(6,2) NOT NULL,
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg DECIMAL(7,2),
    cholesterol_mg DECIMAL(6,2),
    saturated_fat_g DECIMAL(6,2),
    trans_fat_g DECIMAL(6,2),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    gemini_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meal_nutrition_meal_id ON meal_nutrition(meal_id);

-- ================================================
-- DAILY NUTRITION SUMMARY TABLE
-- Aggregated daily nutrition tracking
-- ================================================
CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0,
    total_carbs_g DECIMAL(6,2) DEFAULT 0,
    total_fats_g DECIMAL(6,2) DEFAULT 0,
    total_fiber_g DECIMAL(6,2) DEFAULT 0,
    total_water_ml INTEGER DEFAULT 0,
    meals_count INTEGER DEFAULT 0,
    target_calories INTEGER,
    target_protein_g DECIMAL(6,2),
    target_carbs_g DECIMAL(6,2),
    target_fats_g DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_user_date ON daily_nutrition_summary(user_id, summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_nutrition_summary(summary_date);

-- ================================================
-- FOOD ITEMS TABLE (Optional)
-- Common food items library for quick entry
-- ================================================
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    serving_size VARCHAR(50),
    serving_size_g DECIMAL(6,2),
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fats_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_items_name ON food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);

-- ================================================
-- WEIGHT TRACKING TABLE
-- Track user's weight progress over time
-- ================================================
CREATE TABLE IF NOT EXISTS weight_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, entry_date);
