-- Create verification documents table for storing uploaded documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'government_id', 'selfie', 'social_proof'
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create phone verification table for SMS verification
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  verification_code TEXT,
  code_expires_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create social media verifications table
CREATE TABLE IF NOT EXISTS public.social_media_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL, -- 'linkedin', 'instagram', 'twitter', 'facebook'
  profile_url TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for verification_documents
CREATE POLICY "Users can manage their own verification documents" 
ON public.verification_documents 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for phone_verifications
CREATE POLICY "Users can manage their own phone verifications" 
ON public.phone_verifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for social_media_verifications
CREATE POLICY "Users can manage their own social media verifications" 
ON public.social_media_verifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Update user_verifications table to include phone number
ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS social_media_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS social_media_verified_at TIMESTAMP WITH TIME ZONE;

-- Create function to update user_verifications when phone is verified
CREATE OR REPLACE FUNCTION update_user_phone_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    UPDATE public.user_verifications 
    SET 
      phone_verified = true,
      phone_verified_at = NEW.verified_at,
      phone_number = NEW.phone_number,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phone verification
DROP TRIGGER IF EXISTS phone_verification_trigger ON public.phone_verifications;
CREATE TRIGGER phone_verification_trigger
  AFTER UPDATE ON public.phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_phone_verification();

-- Create function to update user_verifications when photo is verified
CREATE OR REPLACE FUNCTION update_user_photo_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN
    UPDATE public.user_verifications 
    SET 
      photo_verified = true,
      photo_verified_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo verification
DROP TRIGGER IF EXISTS photo_verification_trigger ON public.verification_documents;
CREATE TRIGGER photo_verification_trigger
  AFTER UPDATE ON public.verification_documents
  FOR EACH ROW
  WHEN (NEW.document_type = 'selfie')
  EXECUTE FUNCTION update_user_photo_verification();

-- Create storage buckets for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-documents');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON public.verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON public.phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_verifications_user_id ON public.social_media_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON public.verification_documents(verification_status);