-- Drop dependent views first
DROP VIEW IF EXISTS view_profile_matches CASCADE;
DROP VIEW IF EXISTS view_all_matches_with_reverse CASCADE;

-- Fix daily_matches table schema to match code expectations
DROP TABLE IF EXISTS daily_matches CASCADE;

CREATE TABLE daily_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  suggested_user_id uuid NOT NULL,
  compatibility_score integer NOT NULL DEFAULT 70,
  suggested_date date NOT NULL DEFAULT CURRENT_DATE,
  viewed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily matches" 
ON daily_matches FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily matches" 
ON daily_matches FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert daily matches" 
ON daily_matches FOR INSERT 
WITH CHECK (true);

-- Add missing columns to dating_profiles
ALTER TABLE dating_profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS photo_urls text[],
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Update existing profiles to have email from user_id if possible
-- (This is a placeholder - in reality you'd need to get emails from auth.users)
UPDATE dating_profiles 
SET email = COALESCE(email, user_id::text || '@example.com')
WHERE email IS NULL;

-- Set default empty arrays for photo_urls where null
UPDATE dating_profiles 
SET photo_urls = COALESCE(photo_urls, ARRAY[]::text[])
WHERE photo_urls IS NULL;

-- Parse location into city, state where possible
UPDATE dating_profiles 
SET 
  city = COALESCE(city, split_part(location, ', ', 1)),
  state = COALESCE(state, split_part(location, ', ', 2))
WHERE location IS NOT NULL AND (city IS NULL OR state IS NULL);