-- Simple pre-launch fixes

-- 1. Fix user accounts with unconfirmed emails
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL 
AND email IN ('test2@example.com', 'matched_user@example.com');

-- 2. Create system health check function
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  result jsonb := '{}';
  user_count integer;
  profile_count integer;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Get system counts
  SELECT COUNT(*) FROM auth.users INTO user_count;
  SELECT COUNT(*) FROM public.dating_profiles INTO profile_count;
  
  -- Build result
  result := jsonb_build_object(
    'timestamp', NOW(),
    'current_user_id', current_user_id,
    'total_users', user_count,
    'total_profiles', profile_count,
    'auth_working', current_user_id IS NOT NULL
  );
  
  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.system_health_check() TO authenticated;