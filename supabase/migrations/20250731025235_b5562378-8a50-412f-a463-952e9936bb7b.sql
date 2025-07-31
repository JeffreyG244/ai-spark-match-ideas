-- Disable CAPTCHA requirement for authentication
-- This is a configuration change to allow sign-in without CAPTCHA verification

-- Note: This would normally be done through Supabase dashboard settings
-- For now, we'll ensure our edge functions can handle password reset properly

-- Verify our send-password-reset function exists and is configured correctly
-- The function should be accessible without JWT verification for password reset