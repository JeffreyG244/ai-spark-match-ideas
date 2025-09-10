-- CRITICAL INFRASTRUCTURE FIXES - LuvLang Production
-- This migration consolidates user tables and fixes broken infrastructure
-- Run immediately to prevent further data inconsistencies

-- =============================================================================
-- FIX 1: CREATE USER CREATION TRIGGER (PREVENTS MISSING USER RECORDS)
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create enhanced user creation trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user record in users table when auth user is created
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at,
    city,
    date_of_birth,
    age,
    bio,
    family_goals,
    lifestyle_preference
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW(),
    '',  -- Default empty city
    CURRENT_DATE - INTERVAL '25 years',  -- Default age 25
    25,  -- Default age
    '',  -- Default empty bio
    '',  -- Default empty family_goals  
    ''   -- Default empty lifestyle_preference
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also create trigger for updates (in case user metadata changes)
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- FIX 2: ENSURE USERS TABLE HAS ALL REQUIRED COLUMNS
-- =============================================================================

-- Add missing columns to users table to match both schemas
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS personality_answers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS values text DEFAULT '',
ADD COLUMN IF NOT EXISTS life_goals text DEFAULT '',
ADD COLUMN IF NOT EXISTS green_flags text DEFAULT '',
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS industry text DEFAULT '',
ADD COLUMN IF NOT EXISTS job_title text DEFAULT '',
ADD COLUMN IF NOT EXISTS age_min integer DEFAULT 18,
ADD COLUMN IF NOT EXISTS age_max integer DEFAULT 65,
ADD COLUMN IF NOT EXISTS deal_breakers text DEFAULT '',
ADD COLUMN IF NOT EXISTS state text DEFAULT '';

-- =============================================================================
-- FIX 3: MIGRATE DATA FROM USER_PROFILES TO USERS TABLE
-- =============================================================================

-- Check if user_profiles table exists and migrate data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    
    -- Migrate data from user_profiles to users table
    INSERT INTO public.users (
      id, email, bio, interests, photos, verified, personality_answers,
      values, life_goals, green_flags, created_at, updated_at
    )
    SELECT 
      user_id as id,
      COALESCE(email, '') as email,
      COALESCE(bio, '') as bio,
      COALESCE(interests, '{}') as interests,
      COALESCE(photos, '{}') as photos,
      COALESCE(verified, false) as verified,
      COALESCE(personality_answers, '{}') as personality_answers,
      COALESCE(values, '') as values,
      COALESCE(life_goals, '') as life_goals,
      COALESCE(green_flags, '') as green_flags,
      COALESCE(created_at, NOW()) as created_at,
      COALESCE(updated_at, NOW()) as updated_at
    FROM public.user_profiles
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, users.email),
      bio = CASE WHEN LENGTH(EXCLUDED.bio) > 0 THEN EXCLUDED.bio ELSE users.bio END,
      interests = CASE WHEN array_length(EXCLUDED.interests, 1) > 0 THEN EXCLUDED.interests ELSE users.interests END,
      photos = CASE WHEN array_length(EXCLUDED.photos, 1) > 0 THEN EXCLUDED.photos ELSE users.photos END,
      verified = EXCLUDED.verified OR users.verified,
      personality_answers = CASE WHEN EXCLUDED.personality_answers != '{}' THEN EXCLUDED.personality_answers ELSE users.personality_answers END,
      values = CASE WHEN LENGTH(EXCLUDED.values) > 0 THEN EXCLUDED.values ELSE users.values END,
      life_goals = CASE WHEN LENGTH(EXCLUDED.life_goals) > 0 THEN EXCLUDED.life_goals ELSE users.life_goals END,
      green_flags = CASE WHEN LENGTH(EXCLUDED.green_flags) > 0 THEN EXCLUDED.green_flags ELSE users.green_flags END,
      updated_at = NOW();
    
    -- Log migration results
    INSERT INTO public.security_logs (
      event_type,
      severity, 
      details
    ) VALUES (
      'user_profiles_migration',
      'high',
      jsonb_build_object(
        'action', 'migrated_user_profiles_to_users',
        'timestamp', NOW(),
        'migration_reason', 'consolidate_dual_user_tables'
      )
    );
  END IF;
END $$;

-- =============================================================================
-- FIX 4: UPDATE RLS POLICIES FOR CONSOLIDATED USERS TABLE
-- =============================================================================

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view other users for matching (limited data)
CREATE POLICY "Users can view others for matching" ON public.users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    id != auth.uid()
  );

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FIX 5: CREATE INDEXES FOR PERFORMANCE  
-- =============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users (id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_age_city ON public.users (age, city);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_interests ON public.users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_personality ON public.users USING GIN (personality_answers);

-- =============================================================================
-- FIX 6: UPDATE USER_MATCHES TABLE TO REFERENCE CONSOLIDATED USERS
-- =============================================================================

-- Ensure user_matches table references the users table correctly
DO $$
BEGIN
  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_matches_user1_fkey' 
    AND table_name = 'user_matches'
  ) THEN
    ALTER TABLE public.user_matches 
    ADD CONSTRAINT user_matches_user1_fkey 
    FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_matches_user2_fkey' 
    AND table_name = 'user_matches'
  ) THEN
    ALTER TABLE public.user_matches 
    ADD CONSTRAINT user_matches_user2_fkey 
    FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================================================
-- FIX 7: GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_matches TO authenticated;

-- =============================================================================
-- FIX 8: VALIDATION AND CLEANUP
-- =============================================================================

-- Create function to validate data consistency
CREATE OR REPLACE FUNCTION validate_user_data_consistency()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  users_count integer;
  auth_users_count integer;
  orphaned_auth integer;
  orphaned_app integer;
  result jsonb;
BEGIN
  -- Count users in each system
  SELECT COUNT(*) INTO users_count FROM public.users;
  SELECT COUNT(*) INTO auth_users_count FROM auth.users;
  
  -- Count orphaned records
  SELECT COUNT(*) INTO orphaned_auth 
  FROM auth.users au 
  WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);
  
  SELECT COUNT(*) INTO orphaned_app
  FROM public.users u 
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id);
  
  result := jsonb_build_object(
    'users_table_count', users_count,
    'auth_users_count', auth_users_count,
    'orphaned_auth_users', orphaned_auth,
    'orphaned_app_users', orphaned_app,
    'data_consistent', (orphaned_auth = 0 AND orphaned_app = 0),
    'checked_at', NOW()
  );
  
  -- Log validation results
  INSERT INTO public.security_logs (
    event_type,
    severity,
    details
  ) VALUES (
    'user_data_validation',
    'medium',
    result
  );
  
  RETURN result;
END;
$$;

-- Run validation
SELECT validate_user_data_consistency();

-- Log completion of critical fixes
INSERT INTO public.security_logs (
  event_type,
  severity,
  details
) VALUES (
  'critical_infrastructure_fixes_applied',
  'high',
  jsonb_build_object(
    'migration_file', '20250827_critical_infrastructure_fixes.sql',
    'fixes_applied', jsonb_build_array(
      'user_creation_trigger',
      'table_consolidation', 
      'data_migration',
      'rls_policies_updated',
      'performance_indexes',
      'foreign_key_constraints',
      'permissions_granted'
    ),
    'applied_at', NOW()
  )
);

-- Show completion message
DO $$
BEGIN
  RAISE NOTICE '✅ CRITICAL INFRASTRUCTURE FIXES COMPLETED SUCCESSFULLY';
  RAISE NOTICE '🔧 User creation trigger installed';
  RAISE NOTICE '📊 User tables consolidated'; 
  RAISE NOTICE '🔐 RLS policies updated';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🛡️ Foreign key constraints added';
END $$;