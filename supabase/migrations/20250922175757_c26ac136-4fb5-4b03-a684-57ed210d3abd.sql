-- CRITICAL SECURITY FIX: Remove dangerous public access to users table
-- Drop ALL existing policies and recreate secure ones

-- 1. DROP ALL existing policies on users table
DROP POLICY IF EXISTS "Allow anon read for matching" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;  
DROP POLICY IF EXISTS "Public read access for active users" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles for matching" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own data only" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users; 
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data only" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data only" ON public.users;
DROP POLICY IF EXISTS "Users can delete own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete own data only" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- 2. Create SECURE policies for authenticated users only
CREATE POLICY "secure_users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "secure_users_update_own"
ON public.users  
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "secure_users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "secure_users_delete_own"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Service role access for system operations
CREATE POLICY "service_role_full_access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);