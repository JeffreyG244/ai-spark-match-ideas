-- Create the profile-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to view all profile photos (for matching)
CREATE POLICY "Users can view all profile photos" ON storage.objects
FOR SELECT 
TO authenticated 
USING (bucket_id = 'profile-photos');

-- Create policy to allow users to delete their own photos
CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own photos
CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'profile-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);