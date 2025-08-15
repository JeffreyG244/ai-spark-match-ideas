-- Fix security issues from previous migration

-- Update functions with proper search_path for security
CREATE OR REPLACE FUNCTION get_user_membership_level(user_id UUID)
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

CREATE OR REPLACE FUNCTION can_send_message(sender_id UUID, recipient_id UUID)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION update_membership_verification()
RETURNS TRIGGER
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

-- Enable RLS on geography_columns if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geography_columns') THEN
        ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on geometry_columns if it exists  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geometry_columns') THEN
        ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on spatial_ref_sys if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on test table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'test') THEN
        ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;
        
        -- Add basic policy for test table
        CREATE POLICY "Test table access" ON public.test FOR ALL USING (true);
    END IF;
END $$;