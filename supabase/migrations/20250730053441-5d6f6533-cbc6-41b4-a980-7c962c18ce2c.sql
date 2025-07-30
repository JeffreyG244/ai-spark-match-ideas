-- Fix remaining database functions with search path issues
-- These are mostly PostGIS functions that need secure search paths

-- Fix remaining custom/user functions that we can control
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    score integer := 0;
    feedback text[] := '{}';
    has_upper boolean := false;
    has_lower boolean := false;
    has_digit boolean := false;
    has_special boolean := false;
    is_leaked boolean := false;
BEGIN
    -- Check password requirements
    IF length(password) >= 12 THEN
        score := score + 2;
    ELSIF length(password) >= 8 THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must be at least 8 characters long');
    END IF;
    
    -- Check character variety
    IF password ~ '[A-Z]' THEN
        has_upper := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain uppercase letters');
    END IF;
    
    IF password ~ '[a-z]' THEN
        has_lower := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain lowercase letters');
    END IF;
    
    IF password ~ '[0-9]' THEN
        has_digit := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain numbers');
    END IF;
    
    IF password ~ '[^A-Za-z0-9]' THEN
        has_special := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain special characters');
    END IF;
    
    -- Check for common patterns
    IF password ~* '(password|123456|qwerty|admin|login|welcome)' THEN
        feedback := array_append(feedback, 'Password contains common patterns');
        score := score - 2;
    END IF;
    
    -- Check for leaked passwords (placeholder - would integrate with external service)
    -- For now, just mark obvious weak passwords as leaked
    IF password IN ('password', '123456', 'qwerty', 'admin') THEN
        is_leaked := true;
        feedback := array_append(feedback, 'This password has been found in data breaches');
    END IF;
    
    RETURN jsonb_build_object(
        'isStrong', score >= 5 AND NOT is_leaked,
        'score', score,
        'feedback', feedback,
        'isLeaked', is_leaked,
        'hasUpper', has_upper,
        'hasLower', has_lower,
        'hasDigit', has_digit,
        'hasSpecial', has_special
    );
END;
$function$;

-- Enable RLS on the spatial_ref_sys table if it exists and is not protected
DO $$
BEGIN
    -- Check if spatial_ref_sys exists and doesn't have RLS enabled
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'spatial_ref_sys'
    ) THEN
        -- Try to enable RLS (may fail if it's a system table)
        BEGIN
            ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
            
            -- Create a policy that allows read access
            CREATE POLICY "Allow read access to spatial reference systems" 
            ON public.spatial_ref_sys 
            FOR SELECT 
            TO public 
            USING (true);
            
        EXCEPTION WHEN OTHERS THEN
            -- If we can't modify the table, log it but continue
            INSERT INTO public.security_logs (
                event_type,
                severity,
                details
            ) VALUES (
                'rls_enable_failed',
                'medium',
                jsonb_build_object(
                    'table', 'spatial_ref_sys',
                    'reason', 'System table cannot be modified',
                    'error', SQLERRM
                )
            );
        END;
    END IF;
END $$;

-- Create a comprehensive security check function
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
    functions_without_search_path integer;
BEGIN
    -- Check admin user count
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role IN ('admin', 'super_admin');
    
    -- Check tables without RLS in public schema
    SELECT COUNT(*) INTO tables_without_rls
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND n.nspname = 'public'
    AND NOT c.relrowsecurity;
    
    -- Check functions without proper search path
    SELECT COUNT(*) INTO functions_without_search_path
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND (prosecdef = false OR proconfig IS NULL OR NOT (proconfig::text LIKE '%search_path%'))
    FROM pg_proc p
    WHERE p.proname = routine_name;
    
    result := jsonb_build_object(
        'admin_users', admin_count,
        'tables_without_rls', tables_without_rls,
        'functions_insecure', functions_without_search_path,
        'timestamp', now(),
        'recommendations', jsonb_build_array(
            CASE WHEN admin_count = 0 THEN 'Create at least one admin user' ELSE null END,
            CASE WHEN tables_without_rls > 0 THEN 'Enable RLS on all public tables' ELSE null END,
            CASE WHEN functions_without_search_path > 0 THEN 'Secure function search paths' ELSE null END
        ) - 'null'::jsonb
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