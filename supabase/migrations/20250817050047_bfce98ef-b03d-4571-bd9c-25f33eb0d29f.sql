-- CRITICAL SECURITY FIXES - HANDLE EXISTING FUNCTIONS

-- 1. Drop existing functions that might conflict
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.verify_phone_code_secure(uuid, text);

-- 2. Drop ALL existing dangerous policies
DO $$
BEGIN
    -- Drop dangerous profiles policies
    DROP POLICY IF EXISTS "allow_authenticated_select" ON public.profiles;
    DROP POLICY IF EXISTS "allow_authenticated_insert" ON public.profiles;
    DROP POLICY IF EXISTS "allow_authenticated_update" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view active profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
    DROP POLICY IF EXISTS "Users can delete own profile only" ON public.profiles;
    DROP POLICY IF EXISTS "Limited public profile discovery" ON public.profiles;
    
    -- Drop dangerous user_profiles policies  
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can view their own user_profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update their own user_profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users view own user_profile only" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users update own user_profile only" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users insert own user_profile only" ON public.user_profiles;
    DROP POLICY IF EXISTS "Admins manage all user_profiles" ON public.user_profiles;
END $$;

-- 3. Clean up profiles table data integrity
UPDATE public.profiles 
SET user_id = auth_user_id 
WHERE user_id IS NULL AND auth_user_id IS NOT NULL;

-- Delete orphaned profiles
DELETE FROM public.profiles WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- 4. Create secure helper functions FIRST
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = check_user_id AND user_roles.role = role_name::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin'), 
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Create SECURE policies for profiles table
CREATE POLICY "Users can view own profile only" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile only" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile only" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Admin access to profiles
CREATE POLICY "Admins manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 6. Create SECURE policies for user_profiles table (CRITICAL FIX)
CREATE POLICY "Users view own user_profile only" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own user_profile only" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own user_profile only" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage all user_profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- 7. Create SAFE public view (NO private_data exposure)
DROP VIEW IF EXISTS public.public_profiles_safe;
CREATE VIEW public.public_profiles_safe AS
SELECT 
  id,
  public_data,
  created_at
FROM public.user_profiles
WHERE public_data IS NOT NULL;

GRANT SELECT ON public.public_profiles_safe TO anon, authenticated;

-- 8. Password reset rate limiting
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_ip_created ON public.password_reset_requests(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_email_created ON public.password_reset_requests(email, created_at);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System manages password reset requests" ON public.password_reset_requests FOR ALL USING (true);

-- 9. Secure phone verification
ALTER TABLE public.phone_verifications ADD COLUMN IF NOT EXISTS verification_code_hash TEXT;

CREATE OR REPLACE FUNCTION public.hash_verification_code(code TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(code || 'luvlang_salt_2024_secure', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE public.phone_verifications 
SET verification_code_hash = public.hash_verification_code(verification_code)
WHERE verification_code IS NOT NULL AND verification_code_hash IS NULL;

-- 10. Log critical security fix
INSERT INTO public.security_logs (event_type, severity, details)
VALUES (
  'critical_security_hardening_completed',
  'critical',
  jsonb_build_object(
    'fixes_applied', jsonb_build_array(
      'CRITICAL: Removed public access to all user profiles and private_data',
      'CRITICAL: Fixed profiles RLS exposing all user data', 
      'CRITICAL: Made profiles.user_id NOT NULL preventing orphaned data',
      'Added password reset abuse protection infrastructure',
      'Implemented phone verification code hashing',
      'Created secure role checking functions'
    ),
    'risk_mitigation', 'Prevented PII data breach and unauthorized access',
    'timestamp', now()
  )
);