
-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS values text,
ADD COLUMN IF NOT EXISTS life_goals text,
ADD COLUMN IF NOT EXISTS green_flags text,
ADD COLUMN IF NOT EXISTS personality_answers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Update RLS policies if needed
-- (keeping existing policies as they are)
