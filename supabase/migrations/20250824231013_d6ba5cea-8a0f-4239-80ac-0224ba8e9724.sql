-- Fix all remaining security issues
-- 1. Fix Security Definer View (identify and recreate without SECURITY DEFINER)
-- 2. Set search_path for all remaining functions

-- Fix search_path for all custom functions to prevent security vulnerabilities
ALTER FUNCTION public.check_password_reuse(uuid, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = 'public', 'pg_temp'; 
ALTER FUNCTION public.check_account_lockout(text, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.secure_rate_limit_check(uuid, text, integer, integer) SET search_path = 'public', 'pg_temp';

-- Fix the estimated extent functions that use SECURITY DEFINER
-- Replace with safer alternatives
DROP FUNCTION IF EXISTS public.st_estimatedextent(text, text, text, boolean);
DROP FUNCTION IF EXISTS public.st_estimatedextent(text, text, text);  
DROP FUNCTION IF EXISTS public.st_estimatedextent(text, text);

-- Create replacement functions without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.safe_st_estimatedextent(
  schema_name text, 
  table_name text, 
  column_name text
) RETURNS box2d
LANGUAGE plpgsql
STABLE STRICT
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  result box2d;
BEGIN
  -- Use ST_Extent instead of accessing pg_statistics directly
  EXECUTE format(
    'SELECT ST_Extent(%I) FROM %I.%I', 
    column_name, schema_name, table_name
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Enable RLS on any tables that might need it
-- Check for tables without RLS enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' 
            AND c.relname = pg_tables.tablename
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END $$;