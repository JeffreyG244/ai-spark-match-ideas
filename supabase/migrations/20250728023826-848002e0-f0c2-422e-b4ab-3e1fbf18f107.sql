-- Fix Critical Security Issues: Add Missing RLS Policies for Existing Tables

-- 1. Add RLS policies for content_moderation_queue table
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

-- 2. Enable RLS on tables that currently have it disabled (from linter report)
-- Enable RLS on system tables that need it
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_new_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.old_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_migration_profiles_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_migration_view_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_backup ENABLE ROW LEVEL SECURITY;

-- Add restrictive policies for backup and error tables (admin only)
CREATE POLICY "Admin only access to errors" 
ON public.errors 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin only access to match_suggestions" 
ON public.match_suggestions 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin only access to my_new_table" 
ON public.my_new_table 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "No access to old_profiles" 
ON public.old_profiles 
FOR ALL 
USING (false);

CREATE POLICY "No access to pre_migration_profiles_backup" 
ON public.pre_migration_profiles_backup 
FOR ALL 
USING (false);

CREATE POLICY "No access to pre_migration_view_backups" 
ON public.pre_migration_view_backups 
FOR ALL 
USING (false);

CREATE POLICY "No access to profiles_backup" 
ON public.profiles_backup 
FOR ALL 
USING (false);

-- 3. Create enhanced password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
    
    IF password ~ '[^A-Za-z0-9]' THEN
        has_special := true;
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain special characters');
    END IF;
    
    -- Check against common passwords (basic implementation)
    IF lower(password) = ANY(ARRAY['password', '123456', 'password123', 'admin', 'qwerty']) THEN
        is_leaked := true;
        score := 0;
        feedback := array_append(feedback, 'This password is commonly used and not secure');
    END IF;
    
    RETURN jsonb_build_object(
        'score', score,
        'max_score', 6,
        'is_strong', score >= 5 AND NOT is_leaked,
        'feedback', feedback,
        'is_leaked', is_leaked
    );
END;
$function$;

-- 4. Create input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_user_input(input_text text, max_length integer DEFAULT 1000)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    sanitized text;
BEGIN
    -- Remove null characters and control characters
    sanitized := regexp_replace(input_text, '[[:cntrl:]]', '', 'g');
    
    -- Limit length
    IF length(sanitized) > max_length THEN
        sanitized := left(sanitized, max_length);
    END IF;
    
    -- Remove potentially dangerous patterns
    sanitized := regexp_replace(sanitized, '<script[^>]*>.*?</script>', '', 'gi');
    sanitized := regexp_replace(sanitized, 'javascript:', '', 'gi');
    sanitized := regexp_replace(sanitized, 'data:text/html', '', 'gi');
    
    RETURN sanitized;
END;
$function$;

-- 5. Create default admin setup function
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