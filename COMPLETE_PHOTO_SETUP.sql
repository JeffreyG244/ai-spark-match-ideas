
-- ====================================
-- COMPLETE PHOTO UPLOAD DATABASE SETUP
-- ====================================

-- 1. Ensure users table has photo columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN(photos);
CREATE INDEX IF NOT EXISTS idx_users_primary_photo ON users(primary_photo_url);

-- 3. Create storage bucket (manual step required)
-- This must be done via Supabase Dashboard:
-- Storage > Create new bucket > "profile-photos" > Public: Yes

-- 4. Create RLS policies for users table photos
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- Allow users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 5. Create function to update photos_updated_at
CREATE OR REPLACE FUNCTION update_photos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.photos_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS trigger_update_photos_timestamp ON users;
CREATE TRIGGER trigger_update_photos_timestamp
    BEFORE UPDATE OF photos, primary_photo_url ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_photos_timestamp();

-- 7. Storage policies (to be created in Supabase Dashboard > Storage > profile-photos > Policies)
-- 
-- Policy 1: "Allow authenticated uploads"
-- Operation: INSERT
-- Target: authenticated
-- USING: auth.role() = 'authenticated'
--
-- Policy 2: "Allow public photo access"  
-- Operation: SELECT
-- Target: public
-- USING: true
--
-- Policy 3: "Allow users to update own photos"
-- Operation: UPDATE
-- Target: authenticated
-- USING: auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy 4: "Allow users to delete own photos"
-- Operation: DELETE
-- Target: authenticated
-- USING: auth.uid()::text = (storage.foldername(name))[1]

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('photos', 'primary_photo_url', 'photos_updated_at');

-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND indexname LIKE '%photo%';

-- Check RLS policies
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
