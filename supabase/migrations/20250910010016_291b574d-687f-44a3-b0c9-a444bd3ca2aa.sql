-- Add verification columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS identity_verification_status TEXT DEFAULT 'pending';

-- Create an index on verification columns for better performance
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON public.users(phone_verified, photo_verified, identity_verified);

-- Update existing users to have default verification status
UPDATE public.users 
SET 
  phone_verified = FALSE,
  photo_verified = FALSE,
  identity_verified = FALSE,
  identity_verification_status = 'pending'
WHERE phone_verified IS NULL OR photo_verified IS NULL OR identity_verified IS NULL;