-- Fix data integrity issues and improve gender/preference matching

-- 1. Update users table to set default looking_for preferences based on gender
UPDATE users 
SET looking_for = CASE 
  WHEN gender = 'male' AND looking_for IS NULL THEN 'female'
  WHEN gender = 'female' AND looking_for IS NULL THEN 'male'
  ELSE looking_for
END
WHERE looking_for IS NULL;

-- 2. Add constraints to ensure data consistency
ALTER TABLE users 
ADD CONSTRAINT check_gender_values 
CHECK (gender IN ('male', 'female', 'non-binary', 'other'));

ALTER TABLE users 
ADD CONSTRAINT check_looking_for_values 
CHECK (looking_for IN ('male', 'female', 'both', 'non-binary', 'other'));

-- 3. Create function to get user's gender preference compatibility
CREATE OR REPLACE FUNCTION public.get_user_gender_preference(user_uuid uuid)
RETURNS TABLE(gender text, looking_for text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.gender, u.looking_for
  FROM users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Create function to check if two users are gender-compatible
CREATE OR REPLACE FUNCTION public.is_gender_compatible(user1_id uuid, user2_id uuid)
RETURNS boolean AS $$
DECLARE
  user1_gender text;
  user1_looking_for text;
  user2_gender text;
  user2_looking_for text;
BEGIN
  -- Get user 1 preferences
  SELECT gender, looking_for INTO user1_gender, user1_looking_for
  FROM users WHERE id = user1_id;
  
  -- Get user 2 preferences  
  SELECT gender, looking_for INTO user2_gender, user2_looking_for
  FROM users WHERE id = user2_id;
  
  -- Check mutual compatibility
  RETURN (
    (user1_looking_for = user2_gender OR user1_looking_for = 'both') AND
    (user2_looking_for = user1_gender OR user2_looking_for = 'both')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Update daily_matches generation to respect gender preferences
CREATE OR REPLACE FUNCTION public.generate_compatible_matches(target_user_id uuid, match_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  recommended_user_id uuid,
  compatibility_score integer,
  match_factors jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    target_user_id as user_id,
    u.id as recommended_user_id,
    FLOOR(RANDOM() * 41 + 60)::integer as compatibility_score,
    jsonb_build_object(
      'gender_compatible', true,
      'age_compatible', ABS(target_u.age - u.age) <= 10,
      'location_compatible', target_u.city = u.city
    ) as match_factors
  FROM users u
  CROSS JOIN users target_u
  WHERE target_u.id = target_user_id
    AND u.id != target_user_id
    AND u.is_active = true
    AND public.is_gender_compatible(target_user_id, u.id) = true
    AND ABS(COALESCE(target_u.age, 30) - COALESCE(u.age, 30)) <= COALESCE(target_u.age_max - target_u.age_min, 15)
  ORDER BY RANDOM()
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;