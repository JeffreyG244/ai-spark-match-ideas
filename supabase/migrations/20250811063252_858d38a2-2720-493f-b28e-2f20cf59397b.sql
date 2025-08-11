-- Create storage bucket for verification documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to automatically update user_verifications when phone verification is completed
CREATE OR REPLACE FUNCTION update_user_phone_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When a phone verification is marked as verified, update the user_verifications table
  IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    INSERT INTO user_verifications (user_id, phone_verified, phone_verified_at, phone_number)
    VALUES (NEW.user_id, true, NEW.verified_at, NEW.phone_number)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      phone_verified = true,
      phone_verified_at = NEW.verified_at,
      phone_number = NEW.phone_number,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for phone verification updates
DROP TRIGGER IF EXISTS trigger_update_user_phone_verification ON phone_verifications;
CREATE TRIGGER trigger_update_user_phone_verification
  AFTER UPDATE ON phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_phone_verification();

-- Create function to automatically update user_verifications when document verification is completed  
CREATE OR REPLACE FUNCTION update_user_photo_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When a document with type 'selfie' is marked as verified, update user_verifications
  IF NEW.verification_status = 'verified' AND OLD.verification_status != 'verified' AND NEW.document_type = 'selfie' THEN
    INSERT INTO user_verifications (user_id, photo_verified, photo_verified_at)
    VALUES (NEW.user_id, true, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
      photo_verified = true,
      photo_verified_at = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for document verification updates
DROP TRIGGER IF EXISTS trigger_update_user_photo_verification ON verification_documents;
CREATE TRIGGER trigger_update_user_photo_verification
  AFTER UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_photo_verification();