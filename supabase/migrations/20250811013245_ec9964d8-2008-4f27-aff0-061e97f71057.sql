-- Create storage buckets for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 10485760, '{"image/jpeg","image/png","image/webp","image/gif"}'),
  ('user-photos', 'user-photos', true, 10485760, '{"image/jpeg","image/png","image/webp","image/gif"}')
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for profile-photos bucket
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for user-photos bucket
CREATE POLICY "Users can upload their own user photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own user photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own user photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own user photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public viewing of profile photos for matching purposes
CREATE POLICY "Public can view profile photos for matching" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Public can view user photos for matching" ON storage.objects
FOR SELECT USING (bucket_id = 'user-photos');