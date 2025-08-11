-- Add membership verification and messaging features

-- Create an enum for membership verification levels
CREATE TYPE membership_verification_level AS ENUM ('basic', 'premium', 'executive', 'c_suite');

-- Add verification badge to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_verification membership_verification_level DEFAULT 'basic';

-- Create function to get user membership level based on subscription
CREATE OR REPLACE FUNCTION get_user_membership_level(user_id UUID)
RETURNS membership_verification_level
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to check messaging permissions
CREATE OR REPLACE FUNCTION can_send_message(sender_id UUID, recipient_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to update membership verification when subscription changes
CREATE OR REPLACE FUNCTION update_membership_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the user's membership verification level
    UPDATE users 
    SET membership_verification = get_user_membership_level(NEW.user_id)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS update_membership_verification_trigger ON user_subscriptions;
CREATE TRIGGER update_membership_verification_trigger
    AFTER INSERT OR UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_membership_verification();

-- Update existing users' membership verification levels
UPDATE users 
SET membership_verification = get_user_membership_level(id);

-- Add messaging permission check to conversation_messages RLS
DROP POLICY IF EXISTS "Users can send messages with permission check" ON conversation_messages;
CREATE POLICY "Users can send messages with permission check"
ON conversation_messages
FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND 
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_messages.conversation_id 
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    ) AND
    can_send_message(
        auth.uid(), 
        (SELECT CASE 
            WHEN participant_1 = auth.uid() THEN participant_2 
            ELSE participant_1 
        END FROM conversations WHERE id = conversation_messages.conversation_id)
    )
);