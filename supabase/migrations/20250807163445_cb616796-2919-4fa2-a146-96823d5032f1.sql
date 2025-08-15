-- Create a test user with a simple password for debugging
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
    'test@luvlang.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Test","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Also create a simpler test user
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
    'admin@luvlang.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);