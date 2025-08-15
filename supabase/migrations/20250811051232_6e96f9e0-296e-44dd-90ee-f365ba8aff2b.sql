-- Fix critical security issues in Supabase database

-- 1. Add RLS policy for test table or remove it if not needed
DROP TABLE IF EXISTS public.test CASCADE;

-- 2. Fix all database functions with mutable search_path for security
-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    date_of_birth,
    age,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE),
    EXTRACT(YEAR FROM AGE(COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE)))::INTEGER,
    NOW(),
    NOW()
  );
  
  -- Also create professional profile
  INSERT INTO public.professional_profiles (
    user_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Update calculate_user_age function
CREATE OR REPLACE FUNCTION public.calculate_user_age()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  NEW.age := EXTRACT(YEAR FROM AGE(NEW.date_of_birth));
  RETURN NEW;
END;
$$;

-- Update update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      message_count = message_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Update update_membership_verification function
CREATE OR REPLACE FUNCTION public.update_membership_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
    -- Update the user's membership verification level
    UPDATE users 
    SET membership_verification = get_user_membership_level(NEW.user_id)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

-- Update get_user_membership_level function
CREATE OR REPLACE FUNCTION public.get_user_membership_level(user_id uuid)
RETURNS membership_verification_level
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    plan_tier INTEGER;
    membership_level membership_verification_level;
BEGIN
    -- Get the user's current plan tier from subscription
    SELECT mp.tier_level INTO plan_tier
    FROM user_subscriptions us
    JOIN membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = $1 AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- If no active subscription, default to basic
    IF plan_tier IS NULL THEN
        RETURN 'basic';
    END IF;
    
    -- Map tier levels to verification levels
    CASE plan_tier
        WHEN 1 THEN membership_level := 'basic';
        WHEN 2 THEN membership_level := 'premium'; 
        WHEN 3 THEN membership_level := 'executive';
        WHEN 4 THEN membership_level := 'c_suite';
        ELSE membership_level := 'basic';
    END CASE;
    
    RETURN membership_level;
END;
$$;

-- Update can_send_message function
CREATE OR REPLACE FUNCTION public.can_send_message(sender_id uuid, recipient_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    sender_level membership_verification_level;
    recipient_level membership_verification_level;
BEGIN
    -- Get membership levels for both users
    sender_level := get_user_membership_level(sender_id);
    recipient_level := get_user_membership_level(recipient_id);
    
    -- Basic and Premium users can only receive messages, not send to others
    -- Executive and C-Suite can send messages to anyone
    -- Anyone can send to Executive and C-Suite
    
    -- If sender is basic or premium, they can only message if recipient is executive or c_suite
    IF sender_level IN ('basic', 'premium') THEN
        RETURN recipient_level IN ('executive', 'c_suite');
    END IF;
    
    -- If sender is executive or c_suite, they can message anyone
    IF sender_level IN ('executive', 'c_suite') THEN
        RETURN TRUE;
    END IF;
    
    -- Default to false for safety
    RETURN FALSE;
END;
$$;

-- Update validate_password_strength function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    score integer := 0;
    feedback text[] := '{}';
    has_upper boolean := false;
    has_lower boolean := false;
    has_digit boolean := false;
    has_special boolean := false;
    is_leaked boolean := false;
BEGIN
    -- Check password requirements
    IF length(password) >= 12 THEN
        score := score + 2;
    ELSIF length(password) >= 8 THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must be at least 8 characters long');
    END IF;
    
    -- Check character variety
    IF password ~ '[A-Z]' THEN
        has_upper := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain uppercase letters');
    END IF;
    
    IF password ~ '[a-z]' THEN
        has_lower := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain lowercase letters');
    END IF;
    
    IF password ~ '[0-9]' THEN
        has_digit := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain numbers');
    END IF;
    
    IF password ~ '[^a-zA-Z0-9]' THEN
        has_special := true;
        score := score + 2;
    ELSE
        feedback := array_append(feedback, 'Password must contain special characters');
    END IF;
    
    -- Additional security checks
    IF length(password) >= 16 THEN
        score := score + 1;
    END IF;
    
    -- Check for common patterns
    IF password ~ '123|abc|qwe|password|admin' THEN
        score := score - 2;
        feedback := array_append(feedback, 'Password contains common patterns');
    END IF;
    
    RETURN jsonb_build_object(
        'score', score,
        'max_score', 8,
        'is_strong', score >= 6,
        'feedback', feedback,
        'has_upper', has_upper,
        'has_lower', has_lower,
        'has_digit', has_digit,
        'has_special', has_special,
        'length_ok', length(password) >= 8
    );
END;
$$;

-- Update run_security_diagnostics function
CREATE OR REPLACE FUNCTION public.run_security_diagnostics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    result jsonb;
    admin_count integer;
    tables_without_rls integer;
BEGIN
    -- Check admin user count
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role IN ('admin', 'super_admin');
    
    -- Check tables without RLS in public schema (simplified query)
    SELECT COUNT(*) INTO tables_without_rls
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = t.table_name 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    );
    
    result := jsonb_build_object(
        'admin_users', admin_count,
        'tables_without_rls', tables_without_rls,
        'timestamp', now(),
        'recommendations', 
        CASE 
            WHEN admin_count = 0 AND tables_without_rls > 0 THEN
                jsonb_build_array('Create at least one admin user', 'Enable RLS on all public tables')
            WHEN admin_count = 0 THEN
                jsonb_build_array('Create at least one admin user')
            WHEN tables_without_rls > 0 THEN
                jsonb_build_array('Enable RLS on all public tables')
            ELSE
                jsonb_build_array('Security configuration looks good')
        END
    );
    
    -- Log the security diagnostic
    INSERT INTO public.security_logs (
        event_type,
        severity,
        details
    ) VALUES (
        'security_diagnostic',
        'medium',
        result
    );
    
    RETURN result;
END;
$$;

-- 3. Create missing security_logs table for security diagnostics
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

-- Create RLS policies for security_logs
CREATE POLICY "Admin users can view all security logs" ON public.security_logs
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert security logs" ON public.security_logs
    FOR INSERT 
    WITH CHECK (true);

-- 4. Create user_roles table for proper role management
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

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admin users can manage all roles" ON public.user_roles
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 5. Add comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_executive_matches_user_ids ON public.executive_matches(user_id, matched_user_id);
CREATE INDEX IF NOT EXISTS idx_daily_matches_user_id ON public.daily_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_matches_date ON public.daily_matches(date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON public.user_analytics(date);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 6. Create a function to safely check user roles (prevents RLS recursion)
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