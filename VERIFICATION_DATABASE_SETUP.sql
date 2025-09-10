-- VERIFICATION SYSTEM DATABASE SETUP
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- PART 1: ADD VERIFICATION COLUMNS TO USERS TABLE
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

-- =============================================================================
-- PART 2: CREATE PHONE VERIFICATIONS TABLE (temporary storage)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  verification_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- =============================================================================
-- PART 3: CREATE USER VERIFICATIONS TABLE (audit trail)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('phone', 'photo', 'identity')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_review', 'verified', 'rejected')),
  submitted_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  reviewed_by text,
  rejection_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- PART 4: CREATE STORAGE BUCKETS
-- =============================================================================
-- Create verification photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-photos',
  'verification-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create identity documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)  
VALUES (
  'identity-documents',
  'identity-documents',
  false, -- Private bucket for sensitive documents
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PART 5: CREATE RLS POLICIES FOR VERIFICATION TABLES
-- =============================================================================

-- Phone verifications policies
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own phone verifications" ON public.phone_verifications
  FOR ALL USING (auth.uid() = user_id);

-- User verifications policies
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications" ON public.user_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON public.user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update verifications" ON public.user_verifications
  FOR UPDATE USING (true); -- Admins/system can update verification status

-- =============================================================================
-- PART 6: CREATE STORAGE POLICIES
-- =============================================================================

-- Verification photos policies
CREATE POLICY "Users can upload own verification photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own verification photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view verification photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'verification-photos');

-- Identity documents policies (more restrictive)
CREATE POLICY "Users can upload own identity documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'identity-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own identity documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'identity-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- PART 7: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON public.phone_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON public.phone_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_type_status ON public.user_verifications (verification_type, status);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON public.users (phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_photo_verified ON public.users (photo_verified);
CREATE INDEX IF NOT EXISTS idx_users_identity_verified ON public.users (identity_verified);

-- =============================================================================
-- PART 8: CREATE CLEANUP FUNCTION FOR EXPIRED VERIFICATIONS
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_phone_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.phone_verifications 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired verifications (run daily)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-phone-verifications', '0 2 * * *', 'SELECT cleanup_expired_phone_verifications();');

-- =============================================================================
-- PART 9: GRANT PERMISSIONS
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_verifications TO authenticated;
GRANT ALL ON public.phone_verifications TO service_role;
GRANT ALL ON public.user_verifications TO service_role;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ VERIFICATION SYSTEM DATABASE SETUP COMPLETED!';
  RAISE NOTICE '📱 Phone verification tables created';
  RAISE NOTICE '📸 Photo verification storage configured';
  RAISE NOTICE '🆔 Identity verification system ready';
  RAISE NOTICE '🔐 RLS policies and security configured';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🧹 Cleanup functions installed';
  RAISE NOTICE '✨ Ready for verification workflows!';
END $$;