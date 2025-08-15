-- Drop ALL existing storage policies first
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own user photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own user photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload user photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for user photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads for seeding" ON storage.objects;

-- Configure storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-photos', 'user-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create new storage policies
CREATE POLICY "profile_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "profile_photos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "profile_photos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "user_photos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-photos');

CREATE POLICY "user_photos_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "user_photos_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "user_photos_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anonymous uploads for seeding
CREATE POLICY "anon_upload_for_seeding"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id IN ('profile-photos', 'user-photos'));