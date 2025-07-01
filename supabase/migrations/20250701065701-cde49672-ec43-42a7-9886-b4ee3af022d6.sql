
-- Create password rules table for enhanced validation
CREATE TABLE IF NOT EXISTS public.password_rules (
  rule_id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert comprehensive password rules
INSERT INTO public.password_rules (description, pattern)
VALUES 
  ('At least 8 characters', '^.{8,}$'),
  ('At least one uppercase letter', '[A-Z]'),
  ('At least one lowercase letter', '[a-z]'),
  ('At least one number', '[0-9]'),
  ('At least one special character', '[^A-Za-z0-9]'),
  ('No more than 3 consecutive identical characters', '^(?!.*(.)\1{3,}).*$')
ON CONFLICT DO NOTHING;

-- Create enhanced password validation function 
CREATE OR REPLACE FUNCTION public.validate_password_enhanced(password text)
RETURNS TABLE(is_valid boolean, errors text[], score integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  error_list text[] := '{}';
  rule RECORD;
  password_score integer := 0;
  common_passwords text[] := ARRAY['password', '123456', 'password123', 'admin', 'qwerty', 'letmein'];
  password_lower text;
BEGIN
  -- Check against rules
  FOR rule IN SELECT description, pattern FROM public.password_rules LOOP
    IF password !~ rule.pattern THEN
      error_list := array_append(error_list, rule.description);
    ELSE
      password_score := password_score + 10;
    END IF;
  END LOOP;
  
  -- Check against common passwords
  password_lower := lower(password);
  IF password_lower = ANY(common_passwords) THEN
    error_list := array_append(error_list, 'Password is too common');
    password_score := password_score - 30;
  END IF;
  
  -- Bonus points for length
  IF length(password) >= 12 THEN
    password_score := password_score + 10;
  END IF;
  
  IF length(password) >= 16 THEN
    password_score := password_score + 10;
  END IF;
  
  -- Ensure score is not negative
  password_score := GREATEST(password_score, 0);
  
  RETURN QUERY SELECT 
    array_length(error_list, 1) IS NULL OR array_length(error_list, 1) = 0,
    error_list,
    password_score;
END;
$$;

-- Enable RLS on password_rules table
ALTER TABLE public.password_rules ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read password rules (they're not sensitive)
CREATE POLICY "Anyone can read password rules" 
  ON public.password_rules 
  FOR SELECT 
  USING (true);
