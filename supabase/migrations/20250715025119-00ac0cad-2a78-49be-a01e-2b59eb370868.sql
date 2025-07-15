-- Fix swipe_actions foreign key constraint issue
-- The swipe_actions table references 'users' table but dating profiles use auth.users IDs
-- We need to remove the foreign key constraint that's causing the error

-- First, remove existing foreign key constraint if it exists
ALTER TABLE swipe_actions DROP CONSTRAINT IF EXISTS swipe_actions_swiped_user_id_fkey;
ALTER TABLE swipe_actions DROP CONSTRAINT IF EXISTS swipe_actions_swiper_id_fkey;

-- Add zipcode support to cities_states table for better location matching
ALTER TABLE cities_states ADD COLUMN IF NOT EXISTS zipcode TEXT;

-- Add Arnold, MO and other missing cities with zipcode 63010
INSERT INTO cities_states (city, state, state_code, zipcode, country) VALUES 
('Arnold', 'Missouri', 'MO', '63010', 'United States'),
('Imperial', 'Missouri', 'MO', '63052', 'United States'),
('Festus', 'Missouri', 'MO', '63028', 'United States'),
('Crystal City', 'Missouri', 'MO', '63019', 'United States'),
('Hillsboro', 'Missouri', 'MO', '63050', 'United States')
ON CONFLICT (city, state, state_code) DO NOTHING;

-- Create a proper user_profiles table that bridges auth.users and our profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    age INTEGER,
    gender TEXT,
    location TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT,
    interests TEXT[],
    photos TEXT[],
    preferences JSONB DEFAULT '{}',
    personality_answers JSONB DEFAULT '{}',
    values TEXT,
    life_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a view that joins user_matches with proper user data
CREATE OR REPLACE VIEW user_matches AS
SELECT 
    CASE 
        WHEN user1_id < user2_id THEN user1_id 
        ELSE user2_id 
    END AS user1_id,
    CASE 
        WHEN user1_id < user2_id THEN user2_id 
        ELSE user1_id 
    END AS user2_id,
    compatibility_score,
    matched_at,
    is_active
FROM (
    SELECT DISTINCT
        dm1.user_id as user1_id,
        dm1.suggested_user_id as user2_id,
        dm1.compatibility_score,
        dm1.created_at as matched_at,
        true as is_active
    FROM daily_matches dm1
    INNER JOIN daily_matches dm2 
        ON dm1.user_id = dm2.suggested_user_id 
        AND dm1.suggested_user_id = dm2.user_id
    WHERE dm1.user_id < dm1.suggested_user_id -- Prevent duplicates
) matches;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age ON user_profiles(age);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_cities_states_zipcode ON cities_states(zipcode);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_composite ON swipe_actions(swiper_id, swiped_user_id);

-- Create function to calculate compatibility score between users
CREATE OR REPLACE FUNCTION calculate_compatibility_score(user1_id UUID, user2_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user1_profile RECORD;
    user2_profile RECORD;
    score INTEGER := 0;
    age_diff INTEGER;
    shared_interests INTEGER := 0;
BEGIN
    -- Get user profiles
    SELECT * INTO user1_profile FROM user_profiles WHERE user_id = user1_id;
    SELECT * INTO user2_profile FROM user_profiles WHERE user_id = user2_id;
    
    IF user1_profile IS NULL OR user2_profile IS NULL THEN
        RETURN 50; -- Default score if profiles not found
    END IF;
    
    -- Age compatibility (max 20 points)
    age_diff := ABS(COALESCE(user1_profile.age, 25) - COALESCE(user2_profile.age, 25));
    IF age_diff <= 2 THEN
        score := score + 20;
    ELSIF age_diff <= 5 THEN
        score := score + 15;
    ELSIF age_diff <= 10 THEN
        score := score + 10;
    ELSE
        score := score + 5;
    END IF;
    
    -- Location compatibility (max 15 points)
    IF user1_profile.city = user2_profile.city THEN
        score := score + 15;
    ELSIF user1_profile.state = user2_profile.state THEN
        score := score + 10;
    ELSE
        score := score + 5;
    END IF;
    
    -- Interest overlap (max 25 points)
    IF user1_profile.interests IS NOT NULL AND user2_profile.interests IS NOT NULL THEN
        SELECT array_length(
            ARRAY(SELECT UNNEST(user1_profile.interests) INTERSECT SELECT UNNEST(user2_profile.interests)), 
            1
        ) INTO shared_interests;
        
        IF shared_interests IS NOT NULL THEN
            score := score + LEAST(shared_interests * 5, 25);
        END IF;
    END IF;
    
    -- Random factor for variety (max 40 points)
    score := score + (RANDOM() * 40)::INTEGER;
    
    RETURN LEAST(score, 100);
END;
$$;

-- Create function to generate daily matches with proper gender filtering
CREATE OR REPLACE FUNCTION generate_daily_matches_enhanced(target_user_id UUID, match_count INTEGER DEFAULT 5)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_prefs RECORD;
    match_record RECORD;
    matches_inserted INTEGER := 0;
BEGIN
    -- Get user preferences
    SELECT 
        COALESCE(preferences->>'gender_preference', 'Everyone') as gender_preference,
        COALESCE((preferences->>'age_min')::INTEGER, 18) as age_min,
        COALESCE((preferences->>'age_max')::INTEGER, 65) as age_max,
        gender as user_gender
    INTO user_prefs
    FROM user_profiles 
    WHERE user_id = target_user_id;
    
    IF user_prefs IS NULL THEN
        RETURN;
    END IF;
    
    -- Clear existing daily matches for today
    DELETE FROM daily_matches 
    WHERE user_id = target_user_id 
    AND suggested_date = CURRENT_DATE;
    
    -- Generate new matches with proper filtering
    FOR match_record IN 
        SELECT up.user_id, calculate_compatibility_score(target_user_id, up.user_id) as comp_score
        FROM user_profiles up
        WHERE up.user_id != target_user_id
        AND up.age BETWEEN user_prefs.age_min AND user_prefs.age_max
        AND (
            user_prefs.gender_preference = 'Everyone' 
            OR (user_prefs.gender_preference = 'Women' AND up.gender IN ('Female', 'Woman', 'female', 'woman'))
            OR (user_prefs.gender_preference = 'Men' AND up.gender IN ('Male', 'Man', 'male', 'man'))
            OR (user_prefs.gender_preference = 'Non-binary' AND up.gender IN ('Non-binary', 'Nonbinary', 'non-binary'))
        )
        AND up.user_id NOT IN (
            SELECT swiped_user_id FROM swipe_actions WHERE swiper_id = target_user_id
        )
        ORDER BY comp_score DESC
        LIMIT match_count
    LOOP
        INSERT INTO daily_matches (user_id, suggested_user_id, compatibility_score, suggested_date)
        VALUES (target_user_id, match_record.user_id, match_record.comp_score, CURRENT_DATE);
        
        matches_inserted := matches_inserted + 1;
    END LOOP;
    
    RAISE NOTICE 'Generated % daily matches for user %', matches_inserted, target_user_id;
END;
$$;