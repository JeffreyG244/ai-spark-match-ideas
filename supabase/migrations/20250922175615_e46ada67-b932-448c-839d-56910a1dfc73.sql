-- CRITICAL SECURITY FIX: Remove dangerous public access to users table
-- This fixes the vulnerability where the entire users table with PII was publicly readable

-- 1. DROP all dangerous public read policies that expose sensitive data
DROP POLICY IF EXISTS "Allow anon read for matching" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Public read access for active users" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles for matching" ON public.users;

-- 2. Create secure policies for authenticated users only
-- Users can only view their own complete profile
CREATE POLICY "Users can view own complete profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.users  
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile during signup
CREATE POLICY "Users can create own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 3. Create a secure view for public matching data (minimal data only)
CREATE OR REPLACE VIEW public.users_public_matching AS
SELECT 
    id,
    first_name,
    age,
    job_title,
    company,
    industry,
    city,
    state,
    bio,
    interests,
    photos[1] as primary_photo, -- Only first photo
    is_active,
    subscription_tier
FROM public.users
WHERE is_active = true;

-- 4. Allow authenticated users to view the safe public matching view
CREATE POLICY "Authenticated users can view public matching profiles"
ON public.users_public_matching
FOR SELECT
TO authenticated
USING (true);

-- 5. Grant proper permissions
GRANT SELECT ON public.users_public_matching TO authenticated;
GRANT ALL ON public.users TO authenticated;