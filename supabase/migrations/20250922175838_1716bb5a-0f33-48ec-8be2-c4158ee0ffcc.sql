-- Fix remaining critical security issues from linter

-- 1. Enable RLS on tables that are missing it
ALTER TABLE public.users_public_matching ENABLE ROW LEVEL SECURITY;

-- 2. Drop the insecure view and create a proper secure matching view
DROP VIEW IF EXISTS public.users_public_matching;

-- Create a secure function for matching profiles that only shows minimal data
CREATE OR REPLACE FUNCTION public.get_matching_profiles()
RETURNS TABLE (
    id uuid,
    first_name text, 
    age integer,
    job_title text,
    company text,
    industry text,
    city text,
    state text,
    bio text,
    interests text[],
    primary_photo text,
    subscription_tier text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only return minimal data for active users for authenticated users
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.first_name,
        u.age,
        u.job_title,
        u.company,
        u.industry,
        u.city,
        u.state,
        u.bio,
        u.interests,
        CASE 
            WHEN array_length(u.photos, 1) > 0 THEN u.photos[1]
            ELSE NULL 
        END as primary_photo,
        u.subscription_tier
    FROM public.users u
    WHERE u.is_active = true 
    AND u.id != auth.uid(); -- Don't show user their own profile
END;
$$;