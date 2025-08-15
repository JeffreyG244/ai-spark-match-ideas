-- Fix the security diagnostics function with proper SQL syntax
CREATE OR REPLACE FUNCTION public.run_security_diagnostics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    result jsonb;
    admin_count integer;
    tables_without_rls integer;
BEGIN
    -- Check admin user count
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role IN ('admin', 'super_admin');
    
    -- Check tables without RLS in public schema (simplified query)
    SELECT COUNT(*) INTO tables_without_rls
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = t.table_name 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    );
    
    result := jsonb_build_object(
        'admin_users', admin_count,
        'tables_without_rls', tables_without_rls,
        'timestamp', now(),
        'recommendations', 
        CASE 
            WHEN admin_count = 0 AND tables_without_rls > 0 THEN
                jsonb_build_array('Create at least one admin user', 'Enable RLS on all public tables')
            WHEN admin_count = 0 THEN
                jsonb_build_array('Create at least one admin user')
            WHEN tables_without_rls > 0 THEN
                jsonb_build_array('Enable RLS on all public tables')
            ELSE
                jsonb_build_array('Security configuration looks good')
        END
    );
    
    -- Log the security diagnostic
    INSERT INTO public.security_logs (
        event_type,
        severity,
        details
    ) VALUES (
        'security_diagnostic',
        'medium',
        result
    );
    
    RETURN result;
END;
$function$;