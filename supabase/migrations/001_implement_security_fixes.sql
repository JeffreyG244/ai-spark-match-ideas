
-- Enable Row Level Security on critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Matches RLS Policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert their own matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversation Messages RLS Policies
CREATE POLICY "Users can view their own messages" ON conversation_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() IN (
      SELECT participant_1 FROM conversations WHERE id = conversation_id
      UNION
      SELECT participant_2 FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Users can insert their own messages" ON conversation_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Conversations RLS Policies
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can insert conversations they participate in" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Compatibility Answers RLS Policies
CREATE POLICY "Users can view their own compatibility answers" ON compatibility_answers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compatibility answers" ON compatibility_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compatibility answers" ON compatibility_answers
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Matches RLS Policies
CREATE POLICY "Users can view their own daily matches" ON daily_matches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily matches" ON daily_matches
  FOR UPDATE USING (auth.uid() = user_id);

-- User Subscriptions RLS Policies
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Swipe Actions RLS Policies
CREATE POLICY "Users can view their own swipe actions" ON swipe_actions
  FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Users can insert their own swipe actions" ON swipe_actions
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Enhanced password validation function
CREATE OR REPLACE FUNCTION validate_password_enhanced(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    min_length INT := 8;
    has_upper BOOLEAN := false;
    has_lower BOOLEAN := false;
    has_digit BOOLEAN := false;
    has_special BOOLEAN := false;
BEGIN
    -- Check minimum length
    IF length(password) < min_length THEN
        RAISE EXCEPTION 'Password must be at least % characters long', min_length;
    END IF;

    -- Check for uppercase letter
    IF password ~ '[A-Z]' THEN
        has_upper := true;
    END IF;

    -- Check for lowercase letter
    IF password ~ '[a-z]' THEN
        has_lower := true;
    END IF;

    -- Check for digit
    IF password ~ '[0-9]' THEN
        has_digit := true;
    END IF;

    -- Check for special character
    IF password ~ '[^A-Za-z0-9]' THEN
        has_special := true;
    END IF;

    -- Require at least 3 of 4 character types
    IF (has_upper::int + has_lower::int + has_digit::int + has_special::int) < 3 THEN
        RAISE EXCEPTION 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters';
    END IF;

    -- Check against common passwords
    IF lower(password) = ANY(ARRAY[
        'password', '12345678', 'qwerty123', 'password1', 'password123',
        'admin123', 'welcome123', 'letmein123', 'monkey123', 'dragon123'
    ]) THEN
        RAISE EXCEPTION 'Password is too common. Please choose a stronger password.';
    END IF;

    RETURN true;
END;
$$;

-- Create function to clean up old security data
CREATE OR REPLACE FUNCTION cleanup_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Clean up old rate limit entries (older than 24 hours)
    DELETE FROM rate_limits 
    WHERE timestamp < NOW() - INTERVAL '24 hours';
    
    -- Clean up expired rate limit blocks
    DELETE FROM rate_limit_blocks 
    WHERE blocked_until < NOW();
    
    -- Clean up old security logs (older than 90 days, keep critical ones longer)
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND severity NOT IN ('critical', 'high');
    
    -- Clean up very old critical logs (older than 1 year)
    DELETE FROM security_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Create indexes for better performance on security queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp ON rate_limits(timestamp);
