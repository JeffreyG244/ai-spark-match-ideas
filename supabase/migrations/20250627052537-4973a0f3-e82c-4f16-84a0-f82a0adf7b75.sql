
-- Fix the password validation trigger by properly dropping dependencies
-- We need to drop the dependent triggers first

-- Drop the triggers that depend on the function
DROP TRIGGER IF EXISTS validate_user_password ON auth.users;
DROP TRIGGER IF EXISTS validate_password_security ON security_events;
DROP TRIGGER IF EXISTS validate_password_security_trigger ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.validate_password_security() CASCADE;

-- Create a new, simpler trigger that only validates during the signup process
-- This will work with the auth.users table properly
CREATE OR REPLACE FUNCTION public.validate_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run validation on INSERT (new user signup)
  IF TG_OP = 'INSERT' THEN
    -- Basic validation - ensure required fields are present
    IF NEW.email IS NULL OR NEW.email = '' THEN
      RAISE EXCEPTION 'Email is required';
    END IF;
    
    -- Validate email format
    IF NOT (NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the new trigger for user signup validation
CREATE TRIGGER validate_user_signup_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_signup();
