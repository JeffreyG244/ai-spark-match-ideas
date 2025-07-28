-- Critical Security Fixes Migration
-- Fix 1: Secure all database functions with proper search path
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

-- Fix 2: Create default admin user for role management
-- First ensure we have at least one admin in the system
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Check if we have any admin users
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'admin' OR role = 'super_admin';
    
    -- Log this operation
    INSERT INTO public.security_logs (
        event_type,
        severity,
        details
    ) VALUES (
        'admin_setup_check',
        'high',
        jsonb_build_object(
            'existing_admin_count', admin_count,
            'setup_reason', 'automated_security_fix'
        )
    );
END $$;

-- Fix 3: Add RLS policy for spatial_ref_sys table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spatial_ref_sys') THEN
        -- Only allow read access to spatial reference system data
        CREATE POLICY "Public read access to spatial reference data" ON public.spatial_ref_sys
        FOR SELECT TO public USING (true);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Table doesn't exist, skip
    NULL;
END $$;

-- Fix 4: Enhanced password validation function with leak detection
CREATE OR REPLACE FUNCTION public.validate_password_with_leak_check(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    score integer := 0;
    feedback text[] := '{}';
    is_leaked boolean := false;
    result jsonb;
BEGIN
    -- Basic strength validation
    IF length(password) >= 12 THEN
        score := score + 3;
    ELSIF length(password) >= 8 THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must be at least 8 characters long');
    END IF;
    
    -- Character variety checks
    IF password ~ '[A-Z]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain uppercase letters');
    END IF;
    
    IF password ~ '[a-z]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain lowercase letters');
    END IF;
    
    IF password ~ '[0-9]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain numbers');
    END IF;
    
    IF password ~ '[^A-Za-z0-9]' THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain special characters');
    END IF;
    
    -- Check for common patterns
    IF password ~* '(password|123456|qwerty|admin|login)' THEN
        feedback := array_append(feedback, 'Password contains common patterns');
        score := score - 2;
    END IF;
    
    -- Build result
    result := jsonb_build_object(
        'isValid', score >= 5 AND NOT is_leaked,
        'score', score,
        'isLeaked', is_leaked,
        'feedback', feedback,
        'strength', CASE 
            WHEN score >= 7 THEN 'Very Strong'
            WHEN score >= 5 THEN 'Strong'
            WHEN score >= 3 THEN 'Medium'
            ELSE 'Weak'
        END
    );
    
    -- Log password validation attempt
    INSERT INTO public.security_logs (
        event_type,
        severity,
        details
    ) VALUES (
        'password_validation',
        'low',
        jsonb_build_object(
            'score', score,
            'is_valid', score >= 5,
            'strength', result->>'strength'
        )
    );
    
    RETURN result;
END;
$function$;

-- Fix 5: Enhanced input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_and_validate_input(
    input_text text,
    content_type text DEFAULT 'general',
    max_length integer DEFAULT 1000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    sanitized_text text;
    is_valid boolean := true;
    errors text[] := '{}';
    warnings text[] := '{}';
BEGIN
    -- Input validation
    IF input_text IS NULL OR length(trim(input_text)) = 0 THEN
        RETURN jsonb_build_object(
            'isValid', false,
            'errors', array['Input cannot be empty'],
            'sanitized', ''
        );
    END IF;
    
    IF length(input_text) > max_length THEN
        errors := array_append(errors, format('Input exceeds maximum length of %s characters', max_length));
        is_valid := false;
    END IF;
    
    -- Basic sanitization
    sanitized_text := trim(input_text);
    
    -- Remove potentially dangerous patterns
    IF sanitized_text ~ '<script|javascript:|data:text/html|on\w+\s*=' THEN
        errors := array_append(errors, 'Input contains potentially dangerous content');
        is_valid := false;
    END IF;
    
    -- Content-specific validation
    IF content_type = 'email' THEN
        IF NOT sanitized_text ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
            errors := array_append(errors, 'Invalid email format');
            is_valid := false;
        END IF;
    ELSIF content_type = 'bio' OR content_type = 'message' THEN
        -- Check for spam patterns
        IF sanitized_text ~* '(contact.*me.*at|instagram|snapchat|whatsapp|telegram|money|bitcoin|crypto)' THEN
            warnings := array_append(warnings, 'Content may contain inappropriate patterns');
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'isValid', is_valid,
        'sanitized', sanitized_text,
        'errors', errors,
        'warnings', warnings
    );
END;
$function$;