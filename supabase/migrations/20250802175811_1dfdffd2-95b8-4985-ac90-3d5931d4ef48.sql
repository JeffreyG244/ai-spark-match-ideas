-- Fix auth configuration and add missing policies
-- Add authentication trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.dating_profiles (
    user_id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing RLS policies for geography and geometry columns
ALTER TABLE "public"."geography_columns" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geography_columns_read_access" ON "public"."geography_columns" 
AS PERMISSIVE FOR SELECT 
TO authenticated 
USING (true);

ALTER TABLE "public"."geometry_columns" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geometry_columns_read_access" ON "public"."geometry_columns" 
AS PERMISSIVE FOR SELECT 
TO authenticated 
USING (true);

-- Add AI match results table to track N8N processing
CREATE TABLE IF NOT EXISTS public.ai_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  compatibility_score DECIMAL(3,2),
  personality_analysis JSONB,
  match_recommendations JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_ai_results" ON public.ai_match_results
AS PERMISSIVE FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_ai_results" ON public.ai_match_results
AS PERMISSIVE FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "system_can_insert_ai_results" ON public.ai_match_results
AS PERMISSIVE FOR INSERT 
TO authenticated 
WITH CHECK (true);