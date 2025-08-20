-- Create the profile-photos storage bucket
-- This migration sets up the complete photo upload infrastructure

-- Step 1: Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing conflicting policies
DROP POLICY IF EXISTS "authenticated_upload_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_profile_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_profile_photos" ON storage.objects;

-- Step 4: Create storage policies for profile-photos bucket

-- Policy 1: Allow authenticated users to upload photos
CREATE POLICY "authenticated_upload_profile_photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to photos
CREATE POLICY "public_read_profile_photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-photos');

-- Policy 3: Allow users to update their own photos
CREATE POLICY "authenticated_update_own_profile_photos" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to delete their own photos
CREATE POLICY "authenticated_delete_own_profile_photos" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Ensure user_profiles table exists with photo columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;

-- Step 6: Create index for photo queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_photo_urls ON user_profiles USING GIN(photo_urls);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_photo ON user_profiles(primary_photo_url);

-- Step 7: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create/update user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Step 9: Create function to update photo timestamps
CREATE OR REPLACE FUNCTION update_photo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 10: Create trigger for photo updates
DROP TRIGGER IF EXISTS update_photo_timestamp_trigger ON user_profiles;
CREATE TRIGGER update_photo_timestamp_trigger
    BEFORE UPDATE OF photo_urls, primary_photo_url ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_photo_timestamp();

-- Verification queries
SELECT 'Bucket created' as status, count(*) as bucket_count 
FROM storage.buckets WHERE name = 'profile-photos';

SELECT 'Policies created' as status, count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' 
AND policyname LIKE '%profile_photos%';