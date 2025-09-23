-- COMPREHENSIVE SECURITY FIX: Address all critical security linter issues

-- 1. Enable RLS on the spatial_ref_sys table (PostGIS system table)
-- This table is used by PostGIS for spatial reference systems and is safe to enable RLS on
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- 2. Create a permissive policy for spatial_ref_sys (it's reference data, safe to read)
CREATE POLICY "Allow read access to spatial reference systems"
ON public.spatial_ref_sys
FOR SELECT
TO public
USING (true);

-- 3. Ensure geometry_columns and geography_columns views are secure
-- These are PostGIS system views, grant appropriate permissions
GRANT SELECT ON public.geometry_columns TO authenticated;
GRANT SELECT ON public.geography_columns TO authenticated;
REVOKE ALL ON public.geometry_columns FROM anon;
REVOKE ALL ON public.geography_columns FROM anon;

-- 4. Secure the user_interests_view 
GRANT SELECT ON public.user_interests_view TO authenticated;
REVOKE ALL ON public.user_interests_view FROM anon;

-- 5. Add comprehensive security logging
INSERT INTO public.security_logs (event_type, severity, details)
VALUES (
    'comprehensive_security_fix', 
    'high', 
    jsonb_build_object(
        'action', 'enabled_rls_on_system_tables',
        'tables_fixed', ARRAY['spatial_ref_sys'],
        'views_secured', ARRAY['geometry_columns', 'geography_columns', 'user_interests_view'],
        'description', 'Fixed critical RLS and view security issues',
        'timestamp', now()
    )
);

-- 6. Add security comments for documentation
COMMENT ON TABLE public.spatial_ref_sys IS 
'PostGIS spatial reference system table. RLS enabled for security compliance with permissive read policy.';

COMMENT ON VIEW public.geometry_columns IS 
'PostGIS geometry metadata view. Access restricted to authenticated users only.';

COMMENT ON VIEW public.geography_columns IS 
'PostGIS geography metadata view. Access restricted to authenticated users only.';