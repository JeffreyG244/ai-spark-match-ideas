-- Fix Critical Security Issues: Add Missing RLS Policies and Secure Database Functions

-- 1. Add RLS policies for mutual_matches table (which has no policies)
CREATE POLICY "Users can view their mutual matches" 
ON public.mutual_matches 
FOR SELECT 
USING (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid());

CREATE POLICY "System can create mutual matches" 
ON public.mutual_matches 
FOR INSERT 
WITH CHECK (true);

-- 2. Enable RLS on tables that have it disabled
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;

-- Add basic policies for these system tables
CREATE POLICY "Allow read access to geography_columns" 
ON public.geography_columns 
FOR SELECT 
USING (true);

CREATE POLICY "Allow read access to geometry_columns" 
ON public.geometry_columns 
FOR SELECT 
USING (true);

-- 3. Secure remaining PostGIS functions with proper search_path
CREATE OR REPLACE FUNCTION public.st_shiftlongitude(geometry)
RETURNS geometry
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT COST 50
SET search_path TO 'public', 'pg_temp'
AS '$libdir/postgis-3', 'LWGEOM_longitude_shift';

CREATE OR REPLACE FUNCTION public.st_wrapx(geom geometry, wrap double precision, move double precision)
RETURNS geometry
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT COST 50
SET search_path TO 'public', 'pg_temp'
AS '$libdir/postgis-3', 'ST_WrapX';

CREATE OR REPLACE FUNCTION public.st_memsize(geometry)
RETURNS integer
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT
SET search_path TO 'public', 'pg_temp'
AS '$libdir/postgis-3', 'LWGEOM_mem_size';

CREATE OR REPLACE FUNCTION public.st_summary(geometry)
RETURNS text
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT COST 50
SET search_path TO 'public', 'pg_temp'
AS '$libdir/postgis-3', 'LWGEOM_summary';

CREATE OR REPLACE FUNCTION public.st_npoints(geometry)
RETURNS integer
LANGUAGE c
IMMUTABLE PARALLEL SAFE STRICT COST 50
SET search_path TO 'public', 'pg_temp'
AS '$libdir/postgis-3', 'LWGEOM_npoints';

-- 4. Create enhanced password validation function
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

-- 5. Create session security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_session_security()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Log current session details for security monitoring
    INSERT INTO public.security_logs (
        event_type,
        severity,
        details,
        user_id
    ) VALUES (
        'session_check',
        'low',
        jsonb_build_object(
            'user_agent', current_setting('request.headers')::jsonb->>'user-agent',
            'ip_address', inet_client_addr(),
            'session_time', now(),
            'user_id', auth.uid()
        ),
        auth.uid()
    );
END;
$function$;

-- 6. Create role validation function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.validate_role_assignment(assigner_id uuid, target_user_id uuid, new_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Super admins can assign any role
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = assigner_id AND role = 'super_admin') THEN
        RETURN true;
    END IF;
    
    -- Admins can assign user and moderator roles but not admin or super_admin
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = assigner_id AND role = 'admin') THEN
        RETURN new_role IN ('user', 'moderator');
    END IF;
    
    -- Users cannot assign roles
    RETURN false;
END;
$function$;

-- 7. Create input sanitization function
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