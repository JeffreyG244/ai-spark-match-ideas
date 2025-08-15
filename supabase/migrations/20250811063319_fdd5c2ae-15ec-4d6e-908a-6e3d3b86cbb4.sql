-- Create storage bucket for verification documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification documents" ON storage.objects;

-- Create storage policies for verification documents
CREATE POLICY "Users can upload verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);