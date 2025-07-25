-- Fix Critical Security Issues: Add Missing RLS Policies and Secure Database Functions

-- 1. Add RLS policies for active_users table
CREATE POLICY "Users can view other active users for matching" 
ON public.active_users 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own active status" 
ON public.active_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active status" 
ON public.active_users 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active status" 
ON public.active_users 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Add RLS policies for mutual_matches table
CREATE POLICY "Users can view their mutual matches" 
ON public.mutual_matches 
FOR SELECT 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "System can create mutual matches" 
ON public.mutual_matches 
FOR INSERT 
WITH CHECK (true);

-- 3. Add RLS policies for content_moderation_queue table
CREATE POLICY "Admins can view moderation queue" 
ON public.content_moderation_queue 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can insert to moderation queue" 
ON public.content_moderation_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update moderation queue" 
ON public.content_moderation_queue 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- 4. Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_daily_matches(target_user_id uuid, match_count integer DEFAULT 5)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Insert daily matches for users not already swiped on today
  INSERT INTO daily_matches (user_id, suggested_user_id, compatibility_score)
  SELECT 
    target_user_id,
    up.user_id,
    calculate_compatibility_score(target_user_id, up.user_id)
  FROM user_profiles up
  WHERE up.user_id != target_user_id
    AND up.user_id NOT IN (
      -- Exclude users already swiped on
      SELECT swiped_user_id FROM swipe_actions 
      WHERE swiper_id = target_user_id
    )
    AND up.user_id NOT IN (
      -- Exclude users already suggested today
      SELECT suggested_user_id FROM daily_matches 
      WHERE user_id = target_user_id 
      AND suggested_date = CURRENT_DATE
    )
  ORDER BY calculate_compatibility_score(target_user_id, up.user_id) DESC
  LIMIT match_count
  ON CONFLICT (user_id, suggested_user_id, suggested_date) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_profile_manually(user_id uuid, email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Only create profile if it doesn't exist
  INSERT INTO public.user_profiles (user_id, email, created_at, updated_at)
  VALUES (user_id, email, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_user_presence(p_user_id uuid, p_is_online boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (p_user_id, p_is_online, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = p_is_online,
    last_seen = CASE WHEN p_is_online THEN now() ELSE user_presence.last_seen END,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_paypal_webhook(p_webhook_event jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Check the event type
    IF p_webhook_event->>'event_type' = 'PAYMENT.SALE.COMPLETED' THEN
        -- Update payment status in paypal_payments table
        UPDATE public.paypal_payments
        SET status = 'completed', updated_at = now()
        WHERE paypal_order_id = p_webhook_event->'resource'->>'id';
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_paypal_payment(p_user_id uuid, p_amount numeric, p_currency text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    paypal_response jsonb;
BEGIN
    -- Call PayPal API to create payment (pseudo-code, replace with actual API call)
    paypal_response := (SELECT * FROM external_api_call('https://api.sandbox.paypal.com/v1/payments/payment', 
        jsonb_build_object(
            'intent', 'sale',
            'payer', jsonb_build_object('payment_method', 'paypal'),
            'transactions', jsonb_build_array(
                jsonb_build_object(
                    'amount', jsonb_build_object('total', p_amount, 'currency', p_currency),
                    'description', 'Payment description'
                )
            ),
            'redirect_urls', jsonb_build_object(
                'return', 'https://yourapp.com/success',
                'cancel', 'https://yourapp.com/cancel'
            )
        )
    ));

    -- Store payment details in paypal_payments table
    INSERT INTO public.paypal_payments (user_id, paypal_order_id, amount, currency, status)
    VALUES (p_user_id, paypal_response->>'id', p_amount, p_currency, 'created');

    RETURN paypal_response;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- 5. Create default admin user setup function
CREATE OR REPLACE FUNCTION public.setup_default_admin(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get admin user ID from email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert admin role if not exists
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Log the admin setup
        INSERT INTO public.security_logs (
            event_type,
            severity,
            details,
            user_id
        ) VALUES (
            'admin_setup',
            'high',
            jsonb_build_object(
                'admin_email', admin_email,
                'setup_time', now()
            ),
            admin_user_id
        );
    END IF;
END;
$function$;

-- 6. Enhanced session validation function
CREATE OR REPLACE FUNCTION public.validate_session_security(session_id text, device_fingerprint text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    suspicious_activity boolean := false;
BEGIN
    -- Check for suspicious patterns
    IF LENGTH(device_fingerprint) < 10 OR device_fingerprint IS NULL THEN
        suspicious_activity := true;
    END IF;
    
    -- Log suspicious activity
    IF suspicious_activity THEN
        INSERT INTO public.security_logs (
            event_type,
            severity,
            details,
            user_id
        ) VALUES (
            'suspicious_session',
            'high',
            jsonb_build_object(
                'session_id', session_id,
                'device_fingerprint', device_fingerprint,
                'validation_time', now()
            ),
            auth.uid()
        );
        
        RETURN false;
    END IF;
    
    RETURN true;
END;
$function$;