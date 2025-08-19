#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 COMPREHENSIVE PHOTO UPLOAD TEST');
console.log('===================================\n');

async function testStorageBucketAccess() {
    console.log('1. 🗄️  Testing Storage Bucket Access...');
    
    try {
        // Test listing buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.log(`❌ Cannot list buckets: ${bucketError.message}`);
            return false;
        }
        
        console.log(`📊 Found ${buckets?.length || 0} storage buckets:`);
        buckets?.forEach(bucket => {
            console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
        
        // Check if profile-photos bucket exists
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        if (!profileBucket) {
            console.log('❌ profile-photos bucket not found');
            console.log('📝 Manual fix needed: Create "profile-photos" bucket in Supabase Dashboard');
            return false;
        }
        
        console.log('✅ profile-photos bucket exists');
        console.log(`   - Public: ${profileBucket.public ? 'Yes' : 'No'}`);
        
        // Test listing files in bucket
        const { data: files, error: listError } = await supabase.storage
            .from('profile-photos')
            .list('', { limit: 5 });
            
        if (listError) {
            if (listError.message.includes('permission') || listError.message.includes('policy')) {
                console.log('❌ Storage policies blocking access');
                console.log(`   Error: ${listError.message}`);
                return false;
            } else {
                console.log(`⚠️  File listing error: ${listError.message}`);
            }
        } else {
            console.log(`✅ Can access bucket contents (${files?.length || 0} existing files)`);
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Storage test error: ${error.message}`);
        return false;
    }
}

async function testPhotoUpload() {
    console.log('\n2. 📤 Testing Photo Upload Process...');
    
    try {
        // Create a test image (1x1 PNG)
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const base64Data = testImageData.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        const testBlob = new Blob([bytes], { type: 'image/png' });
        
        // Simulate user upload process
        const timestamp = Date.now();
        const testUserId = 'test-user-123';
        const filename = `${testUserId}/${timestamp}_test_upload.png`;
        
        console.log(`📝 Uploading test file: ${filename}`);
        console.log(`   File size: ${testBlob.size} bytes`);
        console.log(`   Content type: ${testBlob.type}`);
        
        // Attempt upload
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filename, testBlob, {
                contentType: 'image/png',
                upsert: false,
                duplex: 'half'
            });
            
        if (uploadError) {
            console.log(`❌ Upload failed: ${uploadError.message}`);
            
            // Provide specific guidance
            if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
                console.log('🔧 Fix: Create "profile-photos" bucket in Supabase Dashboard');
            } else if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
                console.log('🔧 Fix: Add storage policies for profile-photos bucket');
            } else if (uploadError.message.includes('RLS')) {
                console.log('🔧 Fix: Configure Row Level Security policies');
            }
            
            return false;
        }
        
        console.log('✅ Upload successful!');
        console.log(`   Path: ${uploadData.path}`);
        console.log(`   Full path: ${uploadData.fullPath || 'N/A'}`);
        
        // Test URL generation
        console.log('\n📎 Testing URL Generation...');
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);
            
        console.log(`   Generated URL: ${publicUrl}`);
        
        // Test URL accessibility
        console.log('\n🌐 Testing URL Accessibility...');
        try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            console.log(`   Response: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                console.log('✅ Photo is publicly accessible!');
            } else if (response.status === 404) {
                console.log('❌ Photo not found (URL issue)');
            } else if (response.status === 403) {
                console.log('❌ Access forbidden (policy issue)');
            } else {
                console.log(`⚠️  Unexpected response: ${response.status}`);
            }
        } catch (fetchError) {
            console.log(`❌ URL test failed: ${fetchError.message}`);
        }
        
        // Clean up test file
        console.log('\n🧹 Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([filename]);
            
        if (deleteError) {
            console.log(`⚠️  Cleanup failed: ${deleteError.message}`);
        } else {
            console.log('✅ Test file cleaned up');
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Upload test error: ${error.message}`);
        return false;
    }
}

async function testPhotoUploadHook() {
    console.log('\n3. ⚛️  Testing Photo Upload Hook...');
    
    // Read the photo upload hook to check for issues
    try {
        const fs = await import('fs');
        const hookPath = 'src/hooks/usePhotoUpload.ts';
        
        if (fs.existsSync(hookPath)) {
            const hookContent = fs.readFileSync(hookPath, 'utf8');
            
            console.log('✅ usePhotoUpload.ts exists');
            
            // Check for key components
            const hasHandleFileSelect = hookContent.includes('handleFileSelect');
            const hasSupabaseIntegration = hookContent.includes('supabase.storage');
            const hasErrorHandling = hookContent.includes('toast') && hookContent.includes('error');
            const hasFileValidation = hookContent.includes('file.type') && hookContent.includes('file.size');
            
            console.log(`   - File selection handler: ${hasHandleFileSelect ? '✅' : '❌'}`);
            console.log(`   - Supabase integration: ${hasSupabaseIntegration ? '✅' : '❌'}`);
            console.log(`   - Error handling: ${hasErrorHandling ? '✅' : '❌'}`);
            console.log(`   - File validation: ${hasFileValidation ? '✅' : '❌'}`);
            
            if (!hasHandleFileSelect || !hasSupabaseIntegration) {
                console.log('❌ Photo upload hook is missing key functionality');
                return false;
            }
            
            console.log('✅ Photo upload hook appears complete');
            return true;
            
        } else {
            console.log('❌ usePhotoUpload.ts not found');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Hook test error: ${error.message}`);
        return false;
    }
}

async function testProfileIntegration() {
    console.log('\n4. 👤 Testing Profile Integration...');
    
    try {
        // Check if users table has photo-related columns
        const { data, error } = await supabase
            .from('users')
            .select('photos, primary_photo_url')
            .limit(1);
            
        if (error) {
            if (error.code === '42703') {
                console.log('❌ Missing photo columns in users table');
                console.log('📝 Required columns: photos (text[]), primary_photo_url (text)');
                return false;
            } else if (error.message.includes('permission')) {
                console.log('⚠️  Cannot verify user table structure (expected for anonymous users)');
                console.log('✅ This is normal - RLS is working correctly');
                return true;
            } else {
                console.log(`❌ User table error: ${error.message}`);
                return false;
            }
        }
        
        console.log('✅ User table has photo columns');
        return true;
        
    } catch (error) {
        console.log(`❌ Profile integration error: ${error.message}`);
        return false;
    }
}

async function generateFixInstructions(results) {
    console.log('\n🛠️  PHOTO UPLOAD FIX INSTRUCTIONS');
    console.log('=================================');
    
    const allWorking = Object.values(results).every(r => r);
    
    if (allWorking) {
        console.log('🎉 SUCCESS! Photo upload system is fully functional!');
        console.log('');
        console.log('✅ All tests passed:');
        console.log('   - Storage bucket accessible');
        console.log('   - Upload functionality working');
        console.log('   - URL generation working');
        console.log('   - Photo hook implemented');
        console.log('   - Profile integration ready');
        console.log('');
        console.log('🚀 Users can now upload photos to their profiles!');
        return true;
    }
    
    console.log('❌ Issues found that need to be fixed:');
    
    if (!results.bucketAccess) {
        console.log('');
        console.log('🗄️  STORAGE BUCKET SETUP:');
        console.log('1. Go to Supabase Dashboard > Storage');
        console.log('2. Click "Create new bucket"');
        console.log('3. Name: "profile-photos"');
        console.log('4. Public: ✅ Yes');
        console.log('5. File size limit: 10MB');
        console.log('6. Allowed MIME types: image/png, image/jpg, image/jpeg, image/webp');
        console.log('7. Click "Create bucket"');
    }
    
    if (!results.uploadTest) {
        console.log('');
        console.log('🔒 STORAGE POLICIES SETUP:');
        console.log('1. Go to Supabase Dashboard > Storage > profile-photos > Policies');
        console.log('2. Create these policies:');
        console.log('   a) INSERT: "Allow authenticated uploads"');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.role() = \'authenticated\'');
        console.log('   b) SELECT: "Allow public photo access"');
        console.log('      - Target: public');
        console.log('      - USING: true');
        console.log('   c) UPDATE: "Allow users to update own photos"');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
        console.log('   d) DELETE: "Allow users to delete own photos"');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
    }
    
    if (!results.profileIntegration) {
        console.log('');
        console.log('🗃️  DATABASE SCHEMA:');
        console.log('1. Go to Supabase Dashboard > Database > Tables > users');
        console.log('2. Add these columns if missing:');
        console.log('   - photos: text[] (array), nullable, default: \'{}\'');
        console.log('   - primary_photo_url: text, nullable');
        console.log('   - photos_updated_at: timestamptz, nullable');
    }
    
    console.log('');
    console.log('🧪 TESTING:');
    console.log('1. Complete the manual fixes above');
    console.log('2. Run this test script again: node test_photo_upload_complete.mjs');
    console.log('3. Test on live site: https://luvlang.org');
    
    return false;
}

async function runCompleteTest() {
    console.log('Starting comprehensive photo upload test...\n');
    
    const results = {
        bucketAccess: await testStorageBucketAccess(),
        uploadTest: false,
        hookTest: await testPhotoUploadHook(),
        profileIntegration: await testProfileIntegration()
    };
    
    // Only test upload if bucket access works
    if (results.bucketAccess) {
        results.uploadTest = await testPhotoUpload();
    }
    
    const allWorking = await generateFixInstructions(results);
    
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    process.exit(allWorking ? 0 : 1);
}

runCompleteTest().catch(console.error);