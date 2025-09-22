-- SECURITY FIX: Address SECURITY DEFINER security concerns
-- Remove unnecessary SECURITY DEFINER usage and secure the matching view

-- 1. Drop and recreate the users_public_matching view properly (views don't support RLS policies)
DROP VIEW IF EXISTS public.users_public_matching;

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

-- 2. Set proper ownership and permissions
ALTER VIEW public.users_public_matching OWNER TO postgres;

-- 3. Grant specific permissions (not policies since it's a view)
GRANT SELECT ON public.users_public_matching TO authenticated;
REVOKE ALL ON public.users_public_matching FROM anon;

-- 4. Add security documentation
COMMENT ON VIEW public.users_public_matching IS 
'Secure view for user matching data. Only exposes safe, non-sensitive information and requires authentication to access.';

-- 5. Log the security improvement
INSERT INTO public.security_logs (event_type, severity, details)
VALUES (
    'security_definer_remediation', 
    'low', 
    jsonb_build_object(
        'action', 'secured_matching_view',
        'description', 'Created secure view for user matching without SECURITY DEFINER',
        'timestamp', now()
    )
);