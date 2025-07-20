-- Pre-launch Security and Authentication Fixes (Fixed)

-- 1. Enable RLS on tables that are missing policies (excluding views)
ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_leaks ENABLE ROW LEVEL SECURITY;

-- Create missing RLS policies for content moderation
CREATE POLICY "Admins can manage moderation queue" ON public.content_moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- 2. Fix user accounts with unconfirmed emails (for pre-launch testing)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL 
AND email IN ('test2@example.com', 'matched_user@example.com');

-- 3. Create a comprehensive system health check function
CREATE OR REPLACE FUNCTION public.system_health_check(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  result jsonb := '{}';
  user_count integer;
  profile_count integer;
  auth_user_exists boolean := false;
  user_profile_exists boolean := false;
BEGIN
  -- If no user specified, use current user
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  -- Check if user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = target_user_id) INTO auth_user_exists;
  
  -- Check if user profile exists
  SELECT EXISTS(SELECT 1 FROM public.dating_profiles WHERE user_id = target_user_id) INTO user_profile_exists;
  
  -- Get system counts
  SELECT COUNT(*) FROM auth.users INTO user_count;
  SELECT COUNT(*) FROM public.dating_profiles INTO profile_count;
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', NOW(),
    'target_user_id', target_user_id,
    'auth_user_exists', auth_user_exists,
    'user_profile_exists', user_profile_exists,
    'total_users', user_count,
    'total_profiles', profile_count,
    'system_status', CASE 
      WHEN auth_user_exists AND user_profile_exists THEN 'healthy'
      WHEN auth_user_exists AND NOT user_profile_exists THEN 'missing_profile'
      WHEN NOT auth_user_exists THEN 'user_not_found'
      ELSE 'unknown'
    END
  );
  
  RETURN result;
END;
$$;

-- 4. Create admin user verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  user_record record;
  result jsonb;
BEGIN
  -- Get user details
  SELECT u.id, u.email, u.email_confirmed_at, u.raw_user_meta_data,
         CASE WHEN ur.role IS NOT NULL THEN ur.role ELSE 'user' END as user_role
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE u.email = user_email
  INTO user_record;
  
  IF user_record.id IS NULL THEN
    result := jsonb_build_object(
      'status', 'user_not_found',
      'message', 'No user found with this email'
    );
  ELSE
    result := jsonb_build_object(
      'status', 'user_found',
      'user_id', user_record.id,
      'email', user_record.email,
      'email_confirmed', user_record.email_confirmed_at IS NOT NULL,
      'role', user_record.user_role,
      'has_metadata', user_record.raw_user_meta_data IS NOT NULL
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 5. Grant proper permissions for system functions
GRANT EXECUTE ON FUNCTION public.system_health_check(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_access(text) TO authenticated;