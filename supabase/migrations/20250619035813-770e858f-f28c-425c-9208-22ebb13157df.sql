
-- Add missing columns to user_profiles table for comprehensive profile data
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS personality_answers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Update the existing photos column if it's not the right type
-- (The schema shows it as ARRAY but we want text[] specifically)
