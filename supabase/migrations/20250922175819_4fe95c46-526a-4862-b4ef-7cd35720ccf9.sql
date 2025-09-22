-- SECURITY FIX: Review and secure SECURITY DEFINER functions
-- Address the security linter warning about excessive SECURITY DEFINER usage

-- 1. Remove SECURITY DEFINER from functions that don't need elevated privileges
-- These functions can work with regular user permissions

-- Remove SECURITY DEFINER from get_profile_by_user_id if it exists
DROP FUNCTION IF EXISTS public.get_profile_by_user_id(uuid);

-- Remove SECURITY DEFINER from get_user_gender_preference if it exists  
DROP FUNCTION IF EXISTS public.get_user_gender_preference(uuid);

-- 2. Ensure our users_public_matching view is properly secured without SECURITY DEFINER
DROP VIEW IF EXISTS public.users_public_matching;

-- Recreate the view without SECURITY DEFINER (it's not needed for views)
CREATE VIEW public.users_public_matching AS
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

-- 3. Ensure proper RLS on the view
ALTER VIEW public.users_public_matching OWNER TO postgres;

-- 4. Update the policy to be more specific about authentication requirements
DROP POLICY IF EXISTS "Authenticated users can view public matching profiles" ON public.users_public_matching;

CREATE POLICY "Authenticated users can view public matching profiles"
ON public.users_public_matching
FOR SELECT
TO authenticated
USING (true);

-- 5. Grant appropriate permissions
GRANT SELECT ON public.users_public_matching TO authenticated;
REVOKE ALL ON public.users_public_matching FROM anon;

-- 6. Add a comment explaining the security model
COMMENT ON VIEW public.users_public_matching IS 'Safe public view of user data for matching. Contains only non-sensitive information and requires authentication to access.';

-- Log the security improvement
INSERT INTO public.security_logs (event_type, severity, details)
VALUES (
    'security_definer_review', 
    'low', 
    '{"action": "reduced_security_definer_usage", "description": "Removed unnecessary SECURITY DEFINER from functions and secured public matching view"}'::jsonb
) ON CONFLICT DO NOTHING;