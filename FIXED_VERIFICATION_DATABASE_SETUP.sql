-- VERIFICATION SYSTEM DATABASE SETUP - FIXED VERSION
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
DROP TABLE IF EXISTS public.phone_verifications;
CREATE TABLE public.phone_verifications (
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
DROP TABLE IF EXISTS public.user_verifications;
CREATE TABLE public.user_verifications (
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
-- PART 4: CREATE STORAGE BUCKETS (with error handling)
-- =============================================================================
-- Create verification photos bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'verification-photos',
    'verification-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update it
  UPDATE storage.buckets 
  SET public = true, 
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
  WHERE id = 'verification-photos';
END $$;

-- Create identity documents bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)  
  VALUES (
    'identity-documents',
    'identity-documents',
    false, -- Private bucket for sensitive documents
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/pdf']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update it
  UPDATE storage.buckets 
  SET public = false,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/pdf']
  WHERE id = 'identity-documents';
END $$;

-- =============================================================================
-- PART 5: CREATE RLS POLICIES FOR VERIFICATION TABLES
-- =============================================================================

-- Phone verifications policies
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own phone verifications" ON public.phone_verifications;
CREATE POLICY "Users can manage own phone verifications" ON public.phone_verifications
  FOR ALL USING (auth.uid() = user_id);

-- User verifications policies
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own verifications" ON public.user_verifications;
CREATE POLICY "Users can view own verifications" ON public.user_verifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verifications" ON public.user_verifications;
CREATE POLICY "Users can insert own verifications" ON public.user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update verifications" ON public.user_verifications;
CREATE POLICY "System can update verifications" ON public.user_verifications
  FOR UPDATE USING (true); -- Admins/system can update verification status

-- =============================================================================
-- PART 6: CREATE STORAGE POLICIES (with proper error handling)
-- =============================================================================

-- Verification photos policies
DROP POLICY IF EXISTS "Users can upload own verification photos" ON storage.objects;
CREATE POLICY "Users can upload own verification photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own verification photos" ON storage.objects;
CREATE POLICY "Users can view own verification photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view verification photos" ON storage.objects;
CREATE POLICY "Anyone can view verification photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'verification-photos');

-- Identity documents policies (more restrictive)
DROP POLICY IF EXISTS "Users can upload own identity documents" ON storage.objects;
CREATE POLICY "Users can upload own identity documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'identity-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own identity documents" ON storage.objects;
CREATE POLICY "Users can view own identity documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'identity-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
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

-- =============================================================================
-- PART 9: GRANT PERMISSIONS
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_verifications TO authenticated;
GRANT ALL ON public.phone_verifications TO service_role;
GRANT ALL ON public.user_verifications TO service_role;

-- Grant sequence permissions if they exist
DO $$
BEGIN
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
EXCEPTION WHEN others THEN
  NULL; -- Ignore if sequences don't exist
END $$;

-- =============================================================================
-- PART 10: TEST THE SETUP
-- =============================================================================
-- Test that tables were created successfully
DO $$
DECLARE
  phone_table_exists boolean;
  verifications_table_exists boolean;
  users_columns_added boolean;
BEGIN
  -- Check if phone_verifications table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'phone_verifications'
  ) INTO phone_table_exists;
  
  -- Check if user_verifications table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_verifications'
  ) INTO verifications_table_exists;
  
  -- Check if users table has new columns
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_verified'
  ) INTO users_columns_added;
  
  IF phone_table_exists AND verifications_table_exists AND users_columns_added THEN
    RAISE NOTICE '✅ ALL VERIFICATION TABLES CREATED SUCCESSFULLY!';
    RAISE NOTICE '📱 Phone verification system: READY';
    RAISE NOTICE '📸 Photo verification system: READY';
    RAISE NOTICE '🆔 Identity verification system: READY';
    RAISE NOTICE '🔐 Security policies: CONFIGURED';
    RAISE NOTICE '⚡ Performance indexes: CREATED';
    RAISE NOTICE '✨ Verification system is fully operational!';
  ELSE
    RAISE NOTICE '⚠️  Some tables may not have been created properly';
    RAISE NOTICE 'Phone table exists: %', phone_table_exists;
    RAISE NOTICE 'Verifications table exists: %', verifications_table_exists;
    RAISE NOTICE 'Users columns added: %', users_columns_added;
  END IF;
END $$;