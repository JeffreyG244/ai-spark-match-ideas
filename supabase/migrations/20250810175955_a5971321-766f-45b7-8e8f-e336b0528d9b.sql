-- Create executive dating profiles table to capture comprehensive form data
CREATE TABLE IF NOT EXISTS public.executive_dating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  -- Section 1
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  pronouns TEXT,
  executive_title TEXT,
  industry TEXT,
  success_level TEXT,
  primary_location TEXT,
  lifestyle_level TEXT,
  -- Section 2
  sexual_orientation TEXT[],
  relationship_style TEXT,
  interested_in_meeting TEXT[],
  deal_breakers TEXT[],
  age_range_min INTEGER,
  age_range_max INTEGER,
  distance_preference INTEGER,
  -- Section 3
  political_views TEXT,
  religious_views TEXT,
  family_plans TEXT,
  living_arrangement TEXT,
  core_values TEXT[],
  languages_spoken TEXT[],
  -- Section 4
  myers_briggs_type TEXT,
  attachment_style TEXT,
  love_languages TEXT[],
  conflict_resolution_style TEXT,
  communication_style TEXT[],
  -- Section 5
  weekend_activities TEXT[],
  cultural_interests TEXT[],
  intellectual_pursuits TEXT[],
  vacation_style TEXT[],
  -- Section 6
  photos TEXT[],
  voice_introduction TEXT,
  -- Meta
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.executive_dating_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their executive dating profile"
ON public.executive_dating_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their executive dating profile"
ON public.executive_dating_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their executive dating profile"
ON public.executive_dating_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their executive dating profile"
ON public.executive_dating_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_executive_dating_profiles_updated_at ON public.executive_dating_profiles;
CREATE TRIGGER update_executive_dating_profiles_updated_at
BEFORE UPDATE ON public.executive_dating_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_executive_dating_profiles_user_id ON public.executive_dating_profiles(user_id);
