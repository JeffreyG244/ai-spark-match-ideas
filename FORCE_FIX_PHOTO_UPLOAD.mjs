#!/usr/bin/env node

// This script will FORCE fix the photo upload system and verify it works end-to-end

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

console.log('🚨 FORCE FIXING PHOTO UPLOAD SYSTEM');
console.log('====================================\n');

// Step 1: Test with service role key if available
async function testWithServiceRole() {
    console.log('🔑 Testing with elevated permissions...');
    
    // We'll need the service role key to create buckets
    // This is intentionally commented out as it should not be in the codebase
    /*
    const SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here";
    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    try {
        const { data, error } = await adminSupabase.storage.createBucket('profile-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
        });
        
        if (error && !error.message.includes('already exists')) {
            throw error;
        }
        
        console.log('✅ Storage bucket created/verified');
        return true;
    } catch (error) {
        console.log(`❌ Service role creation failed: ${error.message}`);
        return false;
    }
    */
    
    console.log('⚠️  Service role key not available - using manual approach');
    return false;
}

// Step 2: Create comprehensive SQL script for database setup
async function generateDatabaseSetup() {
    console.log('\n📝 Generating comprehensive database setup script...');
    
    const sqlScript = `
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
`;

    // Write the SQL script to a file
    const fs = await import('fs');
    fs.writeFileSync('COMPLETE_PHOTO_SETUP.sql', sqlScript);
    
    console.log('✅ Database setup script created: COMPLETE_PHOTO_SETUP.sql');
    console.log('📋 Run this script in Supabase SQL Editor');
    
    return true;
}

// Step 3: Test current storage status
async function testCurrentStorage() {
    console.log('\n🗄️  Testing current storage configuration...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        // Test bucket listing
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.log(`❌ Cannot list buckets: ${bucketError.message}`);
            return { bucketExists: false, canUpload: false, canAccess: false };
        }
        
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        const bucketExists = !!profileBucket;
        
        console.log(`${bucketExists ? '✅' : '❌'} Bucket exists: ${bucketExists}`);
        
        if (!bucketExists) {
            return { bucketExists: false, canUpload: false, canAccess: false };
        }
        
        // Test bucket access
        const { data: files, error: listError } = await supabase.storage
            .from('profile-photos')
            .list('', { limit: 1 });
            
        const canAccess = !listError;
        console.log(`${canAccess ? '✅' : '❌'} Can access bucket: ${canAccess}`);
        
        if (listError) {
            console.log(`   Error: ${listError.message}`);
        }
        
        // Test upload capability
        let canUpload = false;
        if (canAccess) {
            try {
                // Create a tiny test image
                const testBlob = new Blob(['test'], { type: 'text/plain' });
                const { error: uploadError } = await supabase.storage
                    .from('profile-photos')
                    .upload('test-upload.txt', testBlob);
                    
                canUpload = !uploadError;
                console.log(`${canUpload ? '✅' : '❌'} Can upload files: ${canUpload}`);
                
                if (uploadError) {
                    console.log(`   Error: ${uploadError.message}`);
                }
                
                // Clean up test file
                if (canUpload) {
                    await supabase.storage.from('profile-photos').remove(['test-upload.txt']);
                }
            } catch (error) {
                console.log(`❌ Upload test failed: ${error.message}`);
            }
        }
        
        return { bucketExists, canUpload, canAccess };
        
    } catch (error) {
        console.log(`❌ Storage test error: ${error.message}`);
        return { bucketExists: false, canUpload: false, canAccess: false };
    }
}

// Step 4: Test photo upload hook logic
async function testPhotoUploadLogic() {
    console.log('\n⚛️  Testing photo upload hook logic...');
    
    try {
        // Read and analyze the hook file
        const fs = await import('fs');
        const hookPath = './src/hooks/usePhotoUpload.ts';
        
        if (!fs.existsSync(hookPath)) {
            console.log('❌ usePhotoUpload.ts not found');
            return false;
        }
        
        const hookContent = fs.readFileSync(hookPath, 'utf8');
        
        // Check for critical components
        const checks = {
            'File validation': hookContent.includes('file.type.startsWith(\'image/\')'),
            'Size validation': hookContent.includes('file.size >'),
            'Supabase upload': hookContent.includes('supabase.storage.from(\'profile-photos\').upload'),
            'Error handling': hookContent.includes('toast') && hookContent.includes('error'),
            'Progress tracking': hookContent.includes('setUploadProgress'),
            'URL generation': hookContent.includes('getPublicUrl'),
            'User authentication': hookContent.includes('useAuth'),
            'File sanitization': hookContent.includes('sanitizedFileName')
        };
        
        console.log('Hook components analysis:');
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${check}`);
        });
        
        const allPassed = Object.values(checks).every(Boolean);
        console.log(`\n${allPassed ? '✅' : '❌'} Upload hook: ${allPassed ? 'COMPLETE' : 'MISSING COMPONENTS'}`);
        
        return allPassed;
        
    } catch (error) {
        console.log(`❌ Hook analysis error: ${error.message}`);
        return false;
    }
}

// Step 5: Generate complete manual setup instructions
async function generateCompleteInstructions(storageStatus, hookStatus) {
    console.log('\n📋 COMPLETE MANUAL SETUP INSTRUCTIONS');
    console.log('=====================================');
    
    if (storageStatus.bucketExists && storageStatus.canUpload && hookStatus) {
        console.log('🎉 PHOTO UPLOAD SYSTEM IS WORKING!');
        console.log('✅ All components are functional');
        console.log('✅ Users can upload photos immediately');
        return true;
    }
    
    console.log('⚠️  Manual setup required. Follow these steps EXACTLY:');
    
    if (!storageStatus.bucketExists) {
        console.log('\n🗄️  STEP 1: CREATE STORAGE BUCKET');
        console.log('1. Open https://app.supabase.com');
        console.log('2. Select your project');
        console.log('3. Go to Storage in the left sidebar');
        console.log('4. Click "Create new bucket"');
        console.log('5. Enter these EXACT settings:');
        console.log('   - Name: profile-photos');
        console.log('   - Public: ✅ CHECKED');
        console.log('   - File size limit: 10');
        console.log('   - Unit: MB');
        console.log('   - Allowed MIME types: image/png,image/jpg,image/jpeg,image/webp');
        console.log('6. Click "Create bucket"');
    }
    
    if (!storageStatus.canUpload) {
        console.log('\n🔒 STEP 2: CREATE STORAGE POLICIES');
        console.log('1. Go to Storage > profile-photos > Policies');
        console.log('2. Click "Add policy" 4 times to create these policies:');
        console.log('');
        console.log('   POLICY 1: Allow authenticated uploads');
        console.log('   - Policy name: Allow authenticated uploads');
        console.log('   - Operation: INSERT');
        console.log('   - Target: authenticated');
        console.log('   - USING expression: auth.role() = \'authenticated\'');
        console.log('   - WITH CHECK: (leave empty)');
        console.log('');
        console.log('   POLICY 2: Allow public photo access');
        console.log('   - Policy name: Allow public photo access');
        console.log('   - Operation: SELECT');
        console.log('   - Target: public');
        console.log('   - USING expression: true');
        console.log('   - WITH CHECK: (leave empty)');
        console.log('');
        console.log('   POLICY 3: Allow users to update own photos');
        console.log('   - Policy name: Allow users to update own photos');
        console.log('   - Operation: UPDATE');
        console.log('   - Target: authenticated');
        console.log('   - USING expression: auth.uid()::text = (storage.foldername(name))[1]');
        console.log('   - WITH CHECK: auth.uid()::text = (storage.foldername(name))[1]');
        console.log('');
        console.log('   POLICY 4: Allow users to delete own photos');
        console.log('   - Policy name: Allow users to delete own photos');
        console.log('   - Operation: DELETE');
        console.log('   - Target: authenticated');
        console.log('   - USING expression: auth.uid()::text = (storage.foldername(name))[1]');
        console.log('   - WITH CHECK: (leave empty)');
    }
    
    console.log('\n🗃️  STEP 3: RUN DATABASE SETUP');
    console.log('1. Go to SQL Editor in Supabase Dashboard');
    console.log('2. Copy and paste the content from COMPLETE_PHOTO_SETUP.sql');
    console.log('3. Click "Run" to execute the SQL');
    console.log('4. Verify no errors appear');
    
    console.log('\n🧪 STEP 4: TEST THE SYSTEM');
    console.log('1. Run: node FORCE_FIX_PHOTO_UPLOAD.mjs');
    console.log('2. Go to https://luvlang.org/settings');
    console.log('3. Sign in with a test account');
    console.log('4. Try uploading a photo');
    console.log('5. Verify photo appears and persists');
    
    console.log('\n⚠️  CRITICAL SUCCESS FACTORS:');
    console.log('- Bucket name MUST be exactly "profile-photos"');
    console.log('- Bucket MUST be set to public');
    console.log('- All 4 storage policies MUST be created');
    console.log('- Database columns MUST be added to users table');
    
    return false;
}

// Step 6: Main execution
async function runCompleteFix() {
    console.log('Starting complete photo upload system fix...\n');
    
    // Test service role approach
    const serviceRoleWorked = await testWithServiceRole();
    
    // Generate database setup regardless
    await generateDatabaseSetup();
    
    // Test current storage status
    const storageStatus = await testCurrentStorage();
    
    // Test hook logic
    const hookStatus = await testPhotoUploadLogic();
    
    // Generate complete instructions
    const systemWorking = await generateCompleteInstructions(storageStatus, hookStatus);
    
    console.log('\n🎯 FINAL STATUS');
    console.log('===============');
    console.log(`Storage bucket exists: ${storageStatus.bucketExists ? '✅' : '❌'}`);
    console.log(`Can upload files: ${storageStatus.canUpload ? '✅' : '❌'}`);
    console.log(`Can access bucket: ${storageStatus.canAccess ? '✅' : '❌'}`);
    console.log(`Upload hook working: ${hookStatus ? '✅' : '❌'}`);
    console.log(`System fully working: ${systemWorking ? '✅' : '❌'}`);
    
    if (systemWorking) {
        console.log('\n🎉 SUCCESS! Photo upload is now working for your users!');
    } else {
        console.log('\n⚠️  Manual setup required. Follow the instructions above.');
        console.log('📝 Files created:');
        console.log('   - COMPLETE_PHOTO_SETUP.sql (run in Supabase SQL Editor)');
        console.log('   - This analysis script for reference');
    }
    
    return systemWorking;
}

// Execute the fix
runCompleteFix()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Critical error:', error);
        process.exit(1);
    });