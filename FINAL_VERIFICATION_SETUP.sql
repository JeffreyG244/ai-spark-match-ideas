-- FINAL VERIFICATION SETUP
-- Based on your database status, you only need these tables

-- =============================================================================
-- CREATE PHONE VERIFICATIONS TABLE (for temporary SMS codes)
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
-- CREATE USER VERIFICATIONS TABLE (for audit trail)
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
-- ENABLE RLS AND CREATE POLICIES
-- =============================================================================
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;

-- Phone verifications policies
DROP POLICY IF EXISTS "Users can manage own phone verifications" ON public.phone_verifications;
CREATE POLICY "Users can manage own phone verifications" ON public.phone_verifications
  FOR ALL USING (auth.uid() = user_id);

-- User verifications policies  
DROP POLICY IF EXISTS "Users can view own verifications" ON public.user_verifications;
CREATE POLICY "Users can view own verifications" ON public.user_verifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verifications" ON public.user_verifications;
CREATE POLICY "Users can insert own verifications" ON public.user_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update verifications" ON public.user_verifications;
CREATE POLICY "System can update verifications" ON public.user_verifications
  FOR UPDATE USING (true);

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-photos',
  'verification-photos', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760, 
  ARRAY['image/jpeg', 'image/png', 'image/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/pdf'];

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_verifications TO authenticated;
GRANT ALL ON public.phone_verifications TO service_role;
GRANT ALL ON public.user_verifications TO service_role;

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON public.phone_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON public.phone_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_type_status ON public.user_verifications (verification_type, status);

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT 
  '🎉 VERIFICATION SYSTEM SETUP COMPLETE!' as status,
  'Phone, Photo, and Identity verification are now ready!' as message;