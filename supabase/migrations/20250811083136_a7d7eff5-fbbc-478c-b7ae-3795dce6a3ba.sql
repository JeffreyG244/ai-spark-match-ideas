-- Fix data integrity issues and improve gender/preference matching

-- Update the users table to ensure consistent data
UPDATE users 
SET gender = 'female' 
WHERE first_name = 'Sarah' AND gender != 'female';

-- Add looking_for preferences for users who don't have them set
UPDATE users 
SET looking_for = CASE 
  WHEN gender = 'male' THEN 'women'
  WHEN gender = 'female' THEN 'men'
  ELSE 'everyone'
END
WHERE looking_for IS NULL;

-- Add a function to get user preferences for better matching
CREATE OR REPLACE FUNCTION get_user_gender_preference(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    user_looking_for text;
BEGIN
    SELECT looking_for INTO user_looking_for
    FROM users 
    WHERE id = user_uuid;
    
    RETURN COALESCE(user_looking_for, 'everyone');
END;
$$;

-- Add a function for gender compatibility check
CREATE OR REPLACE FUNCTION is_gender_compatible(user_id uuid, target_gender text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    user_preference text;
BEGIN
    SELECT get_user_gender_preference(user_id) INTO user_preference;
    
    RETURN CASE
        WHEN user_preference = 'everyone' THEN true
        WHEN user_preference = 'men' AND target_gender = 'male' THEN true
        WHEN user_preference = 'women' AND target_gender = 'female' THEN true
        WHEN user_preference = 'men' AND target_gender IN ('man', 'male') THEN true
        WHEN user_preference = 'women' AND target_gender IN ('woman', 'female') THEN true
        ELSE false
    END;
END;
$$;