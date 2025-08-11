-- Create function to check if user can send messages
CREATE OR REPLACE FUNCTION can_send_message(sender_id uuid, recipient_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  sender_subscription_tier text;
  recipient_subscription_tier text;
BEGIN
  -- Get sender's subscription tier
  SELECT subscription_tier INTO sender_subscription_tier 
  FROM users 
  WHERE id = sender_id;
  
  -- Get recipient's subscription tier  
  SELECT subscription_tier INTO recipient_subscription_tier
  FROM users
  WHERE id = recipient_id;
  
  -- Premium users can always send messages
  IF sender_subscription_tier IN ('premium', 'executive') THEN
    RETURN true;
  END IF;
  
  -- Free users have limited messaging capabilities
  -- For now, allow all messaging but this can be restricted later
  RETURN true;
END;
$$;