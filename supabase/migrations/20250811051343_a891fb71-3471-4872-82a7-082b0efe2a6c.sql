-- Fix critical security issues in Supabase database - Phase 1

-- 1. Remove test table that has no RLS policies
DROP TABLE IF EXISTS public.test CASCADE;

-- 2. Create user_roles table first (required by other functions)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'super_admin', 'moderator', 'user')),
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security_logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details jsonb,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create a function to safely check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, check_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = check_role
  );
$$;