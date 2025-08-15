-- Drop existing function with different return type
DROP FUNCTION IF EXISTS public.secure_rate_limit_check(uuid,text,integer,integer);

-- Create validate_role_assignment function for role management security
CREATE OR REPLACE FUNCTION public.validate_role_assignment(
  target_user_id uuid,
  new_role user_role,
  assigning_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only super_admin can assign admin roles
  IF new_role = 'admin' OR new_role = 'super_admin' THEN
    IF NOT has_role(assigning_user_id, 'super_admin') THEN
      RAISE EXCEPTION 'Insufficient permissions to assign admin roles';
    END IF;
  END IF;
  
  -- Admin can assign moderator and user roles
  IF new_role = 'moderator' OR new_role = 'user' THEN
    IF NOT (has_role(assigning_user_id, 'admin') OR has_role(assigning_user_id, 'super_admin')) THEN
      RAISE EXCEPTION 'Insufficient permissions to assign roles';
    END IF;
  END IF;
  
  -- Log the role assignment attempt
  INSERT INTO security_logs (
    event_type,
    severity,
    details,
    user_id
  ) VALUES (
    'role_assignment_attempt',
    'medium',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'new_role', new_role,
      'assigning_user_id', assigning_user_id
    ),
    assigning_user_id
  );
  
  RETURN true;
END;
$$;

-- Create secure_rate_limit_check function for message rate limiting
CREATE OR REPLACE FUNCTION public.secure_rate_limit_check(
  user_id_param uuid,
  action_type text DEFAULT 'message',
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  window_start timestamptz;
  is_blocked boolean := false;
  block_until timestamptz;
  result jsonb;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Check if user is currently blocked
  SELECT blocked_until INTO block_until
  FROM rate_limit_blocks 
  WHERE identifier = user_id_param::text 
    AND action = action_type 
    AND blocked_until > now()
  LIMIT 1;
  
  IF block_until IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', block_until,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  
  -- Count recent requests
  SELECT COUNT(*) INTO current_count
  FROM rate_limits 
  WHERE identifier = user_id_param::text 
    AND action = action_type 
    AND timestamp > window_start;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    -- Block user with progressive penalty
    block_until := now() + (15 * (current_count - max_requests + 1) || ' minutes')::interval;
    
    INSERT INTO rate_limit_blocks (identifier, action, blocked_until, request_count)
    VALUES (user_id_param::text, action_type, block_until, current_count)
    ON CONFLICT (identifier, action) 
    DO UPDATE SET 
      blocked_until = EXCLUDED.blocked_until,
      request_count = EXCLUDED.request_count;
    
    -- Log security event
    INSERT INTO security_events (
      event_type, 
      severity, 
      details, 
      user_id,
      ip_address
    ) VALUES (
      'rate_limit_exceeded',
      'medium',
      format('User exceeded %s limit: %s/%s requests', action_type, current_count, max_requests),
      user_id_param,
      'server'
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', block_until,
      'current_count', current_count,
      'max_requests', max_requests,
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  
  -- Log the request
  INSERT INTO rate_limits (identifier, action) 
  VALUES (user_id_param::text, action_type);
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', current_count + 1,
    'max_requests', max_requests,
    'remaining', max_requests - current_count - 1
  );
END;
$$;