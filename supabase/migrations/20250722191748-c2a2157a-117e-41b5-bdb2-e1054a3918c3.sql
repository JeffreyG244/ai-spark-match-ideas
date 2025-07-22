-- Add missing profile fields to dating_profiles table
ALTER TABLE public.dating_profiles 
ADD COLUMN IF NOT EXISTS values text,
ADD COLUMN IF NOT EXISTS life_goals text,
ADD COLUMN IF NOT EXISTS green_flags text;