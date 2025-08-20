-- FINAL FIX FOR PHOTO UPLOAD STORAGE POLICIES
-- This will properly secure the bucket and fix upload issues

-- First, drop ALL existing policies on storage.objects for profile-photos
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated uploads" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new, properly configured policies

-- Policy 1: Allow authenticated users to INSERT their own photos in user-specific folders
CREATE POLICY "profile_photos_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow everyone to SELECT (read) photos for public viewing
CREATE POLICY "profile_photos_public_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-photos');

-- Policy 3: Allow authenticated users to UPDATE their own photos only
CREATE POLICY "profile_photos_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow authenticated users to DELETE their own photos only
CREATE POLICY "profile_photos_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure the bucket is configured correctly
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 5242880,  -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'profile-photos';

-- Clean up any test files that shouldn't be there
DELETE FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND name LIKE 'test_%'
AND name NOT LIKE '%/%';  -- Keep files in user folders

DELETE FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND name LIKE 'anon-test-%';

-- Verify the policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd as operation,
    roles,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END as type
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%profile_photos%'
ORDER BY policyname;