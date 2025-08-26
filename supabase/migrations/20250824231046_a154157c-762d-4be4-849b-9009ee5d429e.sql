-- Fix critical security issues without touching PostGIS functions
-- 1. Enable RLS on tables that need it
-- 2. Set search_path for custom functions only  
-- 3. Address security warnings we can fix

-- Enable RLS on tables that should have it but don't
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Enable RLS on specific tables that need it
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'user_password_history', 'security_logs_real', 'admin_actions',
            'audit_logs', 'rate_limit_logs'
        )
        AND NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' 
            AND c.relname = tablename
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
END $$;

-- Create security policies for newly enabled RLS tables (if they exist)
DO $$
BEGIN
    -- Add RLS policies for user_password_history if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_password_history') THEN
        DROP POLICY IF EXISTS "users_manage_own_password_history" ON user_password_history;
        CREATE POLICY "users_manage_own_password_history" 
        ON user_password_history FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
    
    -- Add RLS policies for security_logs_real if it exists  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_logs_real') THEN
        DROP POLICY IF EXISTS "admin_access_security_logs_real" ON security_logs_real;
        CREATE POLICY "admin_access_security_logs_real" 
        ON security_logs_real FOR ALL 
        USING (is_admin());
    END IF;
END $$;

-- Fix search paths for custom functions only (avoid PostGIS functions)
-- Only alter functions that are not part of PostGIS or other extensions
ALTER FUNCTION IF EXISTS public.check_password_reuse(uuid, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION IF EXISTS public.update_conversation_timestamp() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION IF EXISTS public.check_account_lockout(text, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION IF EXISTS public.secure_rate_limit_check(uuid, text, integer, integer) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION IF EXISTS public.handle_new_user() SET search_path = 'public', 'pg_temp';