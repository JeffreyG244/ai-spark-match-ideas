
-- Add all missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS values text,
ADD COLUMN IF NOT EXISTS life_goals text,
ADD COLUMN IF NOT EXISTS green_flags text,
ADD COLUMN IF NOT EXISTS personality_answers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Add missing columns to user_matches table
ALTER TABLE public.user_matches 
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS matched_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_users ON public.user_matches(user1_id, user2_id);
