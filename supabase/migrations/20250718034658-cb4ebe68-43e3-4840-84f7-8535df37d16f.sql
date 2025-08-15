-- Fix the database authentication error by ensuring gen_salt function exists
-- This should resolve the "function gen_salt(unknown) does not exist" error

-- Check if the pgcrypto extension is enabled and enable it if not
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to safely update user last_sign_in without gen_salt issues
-- This replaces any problematic triggers that might be causing the auth error
CREATE OR REPLACE FUNCTION update_user_last_sign_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_sign_in_at without using gen_salt
  UPDATE auth.users 
  SET last_sign_in_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Remove any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_signed_in ON auth.users;

-- Create new safe trigger for last sign in updates
CREATE TRIGGER on_auth_user_signed_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_sign_in();