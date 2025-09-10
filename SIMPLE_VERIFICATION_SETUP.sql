-- SIMPLE VERIFICATION SETUP - Run this step by step
-- Copy and paste ONLY ONE SECTION at a time

-- =============================================================================
-- STEP 1: Add columns to users table
-- =============================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified_at timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_photo_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_verified_at timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verified_at timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verification_status text DEFAULT 'unverified';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_submitted_at timestamp with time zone;