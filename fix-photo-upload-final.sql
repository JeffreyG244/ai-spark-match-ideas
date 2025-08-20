-- DEFINITIVE PHOTO UPLOAD FIX
-- This script safely handles existing policies and creates what's missing
-- Run this in Supabase SQL Editor

-- Step 1: Create bucket (safe if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Create policies (safe if already exist)
-- Using DO blocks to handle "already exists" errors gracefully

DO $$
BEGIN
    -- Policy 1: Public read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can view all profile photos'
    ) THEN
        CREATE POLICY "Users can view all profile photos" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'profile-photos');
    END IF;
END
$$;

DO $$
BEGIN
    -- Policy 2: Authenticated user upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can upload their own profile photos'
    ) THEN
        CREATE POLICY "Users can upload their own profile photos" 
        ON storage.objects 
        FOR INSERT 
        TO authenticated
        WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END
$$;

DO $$
BEGIN
    -- Policy 3: User update own photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can update their own profile photos'
    ) THEN
        CREATE POLICY "Users can update their own profile photos" 
        ON storage.objects 
        FOR UPDATE 
        TO authenticated
        USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END
$$;

DO $$
BEGIN
    -- Policy 4: User delete own photos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can delete their own profile photos'
    ) THEN
        CREATE POLICY "Users can delete their own profile photos" 
        ON storage.objects 
        FOR DELETE 
        TO authenticated
        USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END
$$;

-- Step 3: Verify setup (optional, for confirmation)
-- This query will show you what was created
SELECT 
  'Bucket created: profile-photos exists' as status,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-photos'

UNION ALL

SELECT 
  'Policy: ' || policyname as status,
  'N/A' as is_public,
  null as file_size_limit,
  null as allowed_mime_types
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage' 
  AND policyname LIKE '%profile photos%'
ORDER BY status;