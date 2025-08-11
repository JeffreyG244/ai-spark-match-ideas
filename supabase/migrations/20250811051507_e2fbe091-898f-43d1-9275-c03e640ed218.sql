-- Fix remaining critical security issues - Phase 3

-- 1. Complete fixing remaining functions with mutable search_path
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

-- 2. Add comprehensive indexes for performance
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

-- 3. Enable RLS on spatial_ref_sys table (the one with RLS disabled)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy for spatial_ref_sys (read-only spatial reference data)
CREATE POLICY "Allow read access to spatial reference data" ON public.spatial_ref_sys
    FOR SELECT 
    USING (true);