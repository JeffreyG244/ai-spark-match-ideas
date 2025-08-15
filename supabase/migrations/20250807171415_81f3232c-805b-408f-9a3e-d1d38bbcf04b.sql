-- Create test users properly in Supabase auth
-- This will create users that can actually sign in

-- Create a simple test function for authentication
CREATE OR REPLACE FUNCTION create_test_user(
  email text,
  password text,
  first_name text DEFAULT 'Test',
  last_name text DEFAULT 'User'
) 
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users with proper password hashing
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('first_name', first_name, 'last_name', last_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create the corresponding public.users record with required fields
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    date_of_birth,
    age,
    city,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    email,
    first_name,
    last_name,
    '1990-01-01',
    34,
    'San Francisco',
    NOW(),
    NOW()
  );
  
  RETURN new_user_id;
END;
$$;

-- Create test users
SELECT create_test_user('test@luvlang.com', 'password123', 'Test', 'User');
SELECT create_test_user('admin@luvlang.com', 'admin123', 'Admin', 'User');