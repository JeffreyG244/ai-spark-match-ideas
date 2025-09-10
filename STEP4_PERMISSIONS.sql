-- STEP 4: Grant permissions and create indexes
-- Run this AFTER step 3 completes successfully

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_verifications TO authenticated;
GRANT ALL ON public.phone_verifications TO service_role;
GRANT ALL ON public.user_verifications TO service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON public.phone_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON public.phone_verifications (expires_at);
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_type_status ON public.user_verifications (verification_type, status);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON public.users (phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_photo_verified ON public.users (photo_verified);
CREATE INDEX IF NOT EXISTS idx_users_identity_verified ON public.users (identity_verified);

-- Success message
SELECT 'Verification system database setup complete!' as status;