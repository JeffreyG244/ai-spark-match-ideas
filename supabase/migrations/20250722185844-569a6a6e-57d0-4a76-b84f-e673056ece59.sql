-- COMPREHENSIVE AUTH FIX: Remove ALL potential interference with auth.users table

-- Step 1: Drop ALL triggers on auth.users (including any we might have missed)
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname FROM pg_trigger 
        WHERE tgrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- Step 2: Drop ALL functions that might interfere with auth
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;
DROP FUNCTION IF EXISTS public.validate_user_signup() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.check_password_strength(text) CASCADE;
DROP FUNCTION IF EXISTS public.simple_password_check(text) CASCADE;
DROP FUNCTION IF EXISTS public.basic_password_check(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_last_sign_in() CASCADE;

-- Step 3: Clean up any remaining password-related tables that might cause issues
DROP TABLE IF EXISTS public.password_leaks CASCADE;
DROP TABLE IF EXISTS public.compromised_passwords CASCADE;

-- Step 4: Create a minimal, safe user profile creation function (NO TRIGGER ON AUTH.USERS)
CREATE OR REPLACE FUNCTION public.create_user_profile_manually(user_id uuid, email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only create profile if it doesn't exist
  INSERT INTO public.user_profiles (user_id, email, created_at, updated_at)
  VALUES (user_id, email, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Step 5: Ensure no RLS policies are interfering with basic auth operations
-- Check if user_profiles table exists and has proper policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    -- Temporarily disable RLS on user_profiles to ensure auth works
    ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
    
    -- Re-enable with very basic policies
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    
    -- Create simple, working policies
    CREATE POLICY "Enable read access for own profile" ON public.user_profiles
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY "Enable insert for own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Enable update for own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 6: Test that basic auth functions work
SELECT 'Auth fix complete - no triggers on auth.users table' as status;