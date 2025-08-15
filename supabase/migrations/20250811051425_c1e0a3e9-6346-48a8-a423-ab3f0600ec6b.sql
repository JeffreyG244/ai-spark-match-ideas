-- Fix critical security issues in Supabase database - Phase 2

-- 1. Add RLS policies for new tables
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admin users can manage all roles" ON public.user_roles
    FOR ALL 
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin users can view all security logs" ON public.security_logs
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can insert security logs" ON public.security_logs
    FOR INSERT 
    WITH CHECK (true);

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