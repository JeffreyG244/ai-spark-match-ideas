-- Create storage bucket and policies for photo uploads
-- First, create the profile-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile photos
-- Allow authenticated users to upload their own photos
CREATE POLICY "Allow authenticated users to upload profile photos" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to profile photos
CREATE POLICY "Allow public read access to profile photos" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'profile-photos');

-- Allow users to update their own photos
CREATE POLICY "Allow users to update own profile photos" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY "Allow users to delete own profile photos" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Ensure user_profiles table has photo columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_photo_url TEXT,
ADD COLUMN IF NOT EXISTS photos_updated_at TIMESTAMPTZ;

-- Update RLS policies for user_profiles to allow photo updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create a function to automatically update photos_updated_at
CREATE OR REPLACE FUNCTION public.update_photos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.photo_urls IS DISTINCT FROM NEW.photo_urls THEN
    NEW.photos_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;