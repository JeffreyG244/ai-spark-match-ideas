
-- Create a comprehensive profiles table with all necessary fields for dating app
CREATE TABLE IF NOT EXISTS public.dating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary')),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  bio TEXT NOT NULL CHECK (char_length(bio) <= 140),
  interests TEXT[] NOT NULL,
  relationship_goals TEXT NOT NULL,
  partner_preferences TEXT NOT NULL,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.dating_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for matching functionality)
CREATE POLICY "Public read access for dating profiles" 
  ON public.dating_profiles 
  FOR SELECT 
  USING (true);

-- Create policy for users to manage their own profiles
CREATE POLICY "Users can manage own dating profile" 
  ON public.dating_profiles 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dating_profiles_age ON public.dating_profiles(age);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_gender ON public.dating_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_city ON public.dating_profiles(city);
CREATE INDEX IF NOT EXISTS idx_dating_profiles_interests ON public.dating_profiles USING GIN(interests);
