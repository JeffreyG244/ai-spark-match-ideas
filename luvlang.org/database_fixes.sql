-- LUVLANG.ORG DATABASE FIXES
-- Run these commands in your Supabase SQL Editor

-- ============================================
-- 1. ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================

-- Add user_id column to link profiles to auth.users
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add email column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add photo_urls array column for storing photo URLs
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- Add profile photo metadata
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;

-- Add last updated timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on user_id for fast profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Index on email for user searches
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- 3. UPDATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. STORAGE BUCKET POLICIES
-- ============================================

-- Update storage policies for profile-photos bucket
-- (Run these in the Storage section of Supabase Dashboard)

-- Policy: Allow authenticated users to upload photos
-- INSERT policy on storage.objects for bucket_id = 'profile-photos'
-- USING: auth.role() = 'authenticated'

-- Policy: Allow users to view all photos (for matching)  
-- SELECT policy on storage.objects for bucket_id = 'profile-photos'
-- USING: true

-- Policy: Allow users to update their own photos
-- UPDATE policy on storage.objects for bucket_id = 'profile-photos'  
-- USING: auth.uid()::text = (storage.foldername(name))[1]

-- Policy: Allow users to delete their own photos
-- DELETE policy on storage.objects for bucket_id = 'profile-photos'
-- USING: auth.uid()::text = (storage.foldername(name))[1]

-- ============================================
-- 5. CREATE FUNCTION TO AUTO-UPDATE TIMESTAMP
-- ============================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on profile updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. VERIFY CHANGES
-- ============================================

-- Check the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Run these commands one section at a time in Supabase SQL Editor
-- 2. Verify each section completes successfully before proceeding
-- 3. The storage bucket policies need to be set in the Supabase Dashboard > Storage > Policies
-- 4. After running these, your camera upload should work properly