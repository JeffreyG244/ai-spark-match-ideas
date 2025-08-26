-- Fix critical security issues with correct PostgreSQL syntax
-- Set search paths for custom functions that exist

DO $$
BEGIN
    -- Fix search paths for custom functions
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_password_reuse') THEN
        ALTER FUNCTION public.check_password_reuse(uuid, text) SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_conversation_timestamp') THEN
        ALTER FUNCTION public.update_conversation_timestamp() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_account_lockout') THEN
        ALTER FUNCTION public.check_account_lockout(text, text) SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'secure_rate_limit_check') THEN
        ALTER FUNCTION public.secure_rate_limit_check(uuid, text, integer, integer) SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public', 'pg_temp';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = 'public', 'pg_temp';
    END IF;
END $$;

-- Enable RLS on security_logs table if it exists and isn't already enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_logs' AND table_schema = 'public') THEN
        -- Check if RLS is already enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' 
            AND c.relname = 'security_logs'
            AND c.relrowsecurity = true
        ) THEN
            ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
END $$;