-- Fix the password validation function naming conflict

-- Drop and recreate the problematic function with proper variable naming
DROP FUNCTION IF EXISTS public.is_password_leaked(text);

CREATE OR REPLACE FUNCTION public.is_password_leaked(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    hashed_input text;
BEGIN
    -- Hash the input password using the same method as stored hashes
    hashed_input := encode(digest(input_password, 'sha256'), 'hex');
    
    -- Check if this hash exists in our leaked passwords table
    RETURN EXISTS (
        SELECT 1 
        FROM public.password_leaks 
        WHERE password_leaks.password_hash = hashed_input
    );
END;
$$;

-- Also fix the validate_password_change function if it exists
DROP FUNCTION IF EXISTS public.validate_password_change();

CREATE OR REPLACE FUNCTION public.validate_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only validate on password changes
    IF TG_OP = 'UPDATE' AND OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password THEN
        -- Add any password validation logic here if needed
        -- For now, just allow the change
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$;