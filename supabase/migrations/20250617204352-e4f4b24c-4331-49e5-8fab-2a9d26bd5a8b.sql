
-- Phase 1: Fix Critical RLS Policy Issues (Updated)

-- 1. Clean up admin_actions table policies
DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Service role can insert admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Users can insert their own admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Only admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Only admins can insert admin actions" ON public.admin_actions;

-- Enable RLS on admin_actions if not already enabled
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create proper admin-only policies for admin_actions
CREATE POLICY "Only admins can view admin actions" 
ON public.admin_actions FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only admins can insert admin actions" 
ON public.admin_actions FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 2. Secure rate limiting tables - restrict to service role only
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to rate_limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Allow public access to rate_limit_blocks" ON public.rate_limit_blocks;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage rate limit blocks" ON public.rate_limit_blocks;

-- Only service role and admins can manage rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits FOR ALL 
USING (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage rate limit blocks" 
ON public.rate_limit_blocks FOR ALL 
USING (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'));

-- 3. Fix messaging policies - remove duplicates and use authenticated role
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Public can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can update their conversations" ON public.conversations;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Consolidated conversation policies
CREATE POLICY "Authenticated users can view their conversations" 
ON public.conversations FOR SELECT TO authenticated
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Authenticated users can update their conversations" 
ON public.conversations FOR UPDATE TO authenticated
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Fix conversation_messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Public can view messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Public can send messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Authenticated users can view messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages to their conversations" ON public.conversation_messages;

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Consolidated message policies with proper conversation membership check
CREATE POLICY "Authenticated users can view messages in their conversations" 
ON public.conversation_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

CREATE POLICY "Authenticated users can send messages to their conversations" 
ON public.conversation_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- 4. Secure security_logs table - admin access only
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Users can view their security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "System can create security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Only admins can update security logs" ON public.security_logs;

CREATE POLICY "Only admins can view security logs" 
ON public.security_logs FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can create security logs" 
ON public.security_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update security logs" 
ON public.security_logs FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 5. Secure user_roles table properly
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only super admins can revoke roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can assign roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can revoke roles" 
ON public.user_roles FOR DELETE 
USING (public.has_role(auth.uid(), 'super_admin'));

-- 6. Add proper profile access controls
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view conversation partner profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can view profiles of people they have conversations with
CREATE POLICY "Users can view conversation partner profiles" 
ON public.user_profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE (participant_1 = auth.uid() AND participant_2 = user_profiles.user_id)
    OR (participant_2 = auth.uid() AND participant_1 = user_profiles.user_id)
  )
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. Add security audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Log role changes
  IF TG_TABLE_NAME = 'user_roles' THEN
    INSERT INTO public.security_logs (
      event_type,
      severity,
      details,
      user_id
    ) VALUES (
      'role_change',
      'high',
      jsonb_build_object(
        'action', TG_OP,
        'target_user', COALESCE(NEW.user_id, OLD.user_id),
        'role', COALESCE(NEW.role, OLD.role),
        'table', TG_TABLE_NAME
      ),
      auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

-- 8. Add rate limiting cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Clean up old rate limit entries (older than 24 hours)
  DELETE FROM public.rate_limits 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Clean up expired rate limit blocks
  DELETE FROM public.rate_limit_blocks 
  WHERE blocked_until < NOW();
  
  -- Clean up old security logs (older than 90 days, keep critical ones longer)
  DELETE FROM public.security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND severity NOT IN ('critical', 'high');
  
  -- Clean up very old critical logs (older than 1 year)
  DELETE FROM public.security_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;
