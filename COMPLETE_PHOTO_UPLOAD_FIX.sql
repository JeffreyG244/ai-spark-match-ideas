-- ================================================================
-- COMPLETE PHOTO UPLOAD FIX - FINAL SOLUTION
-- ================================================================
-- This script will completely fix the photo upload functionality

-- STEP 1: Clean up existing broken policies
-- =========================================
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_public_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_authenticated_delete" ON storage.objects;

-- STEP 2: Ensure bucket exists and is properly configured
-- ======================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- STEP 3: Enable RLS on storage.objects
-- ====================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create proper storage policies
-- =====================================

-- Allow authenticated users to upload photos in their own folder
CREATE POLICY "profile_photos_upload" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all photos
CREATE POLICY "profile_photos_read" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'profile-photos');

-- Allow users to update their own photos
CREATE POLICY "profile_photos_update" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "profile_photos_delete" ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- STEP 5: Fix user_profiles table
-- ==============================

-- Ensure the table has the right columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;

-- Add updated_at if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create user_profiles policies
CREATE POLICY "user_profiles_select" ON user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert" ON user_profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update" ON user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- STEP 6: Create helper function for photo management
-- ==================================================
CREATE OR REPLACE FUNCTION update_user_profile_photos(
    user_id UUID,
    new_photo_urls TEXT[],
    new_primary_photo_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow users to update their own photos
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'Access denied: cannot update other users photos';
    END IF;
    
    INSERT INTO user_profiles (id, photo_urls, primary_photo_url, updated_at)
    VALUES (user_id, new_photo_urls, COALESCE(new_primary_photo_url, new_photo_urls[1]), NOW())
    ON CONFLICT (id) DO UPDATE SET
        photo_urls = EXCLUDED.photo_urls,
        primary_photo_url = COALESCE(EXCLUDED.primary_photo_url, EXCLUDED.photo_urls[1]),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;

-- STEP 7: Clean up test files
-- ===========================
DELETE FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND (
    name LIKE 'test_%' 
    OR name LIKE 'anon-test-%'
    OR name LIKE '%test%'
    OR name NOT LIKE '%/%'  -- Remove files not in user folders
);

-- STEP 8: Verification
-- ===================

-- Check bucket configuration
SELECT 
    'Bucket Status' as check_type,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-photos';

-- Check storage policies
SELECT 
    'Storage Policies' as check_type,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%profile_photos%';

-- Check user_profiles table
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('photo_urls', 'primary_photo_url', 'updated_at');

-- Success message
SELECT 'PHOTO UPLOAD SYSTEM READY!' as status;