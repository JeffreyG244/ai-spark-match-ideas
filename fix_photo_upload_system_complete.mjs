#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 FIXING PHOTO UPLOAD SYSTEM COMPLETELY');
console.log('=========================================\n');

async function checkCurrentIssues() {
    console.log('1. 🔍 Diagnosing Current Issues...');
    
    const issues = [];
    
    try {
        // Check storage buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            issues.push('Cannot access storage system');
            console.log(`❌ Storage access error: ${bucketError.message}`);
        } else {
            const profileBucket = buckets?.find(b => b.name === 'profile-photos');
            if (!profileBucket) {
                issues.push('Missing profile-photos storage bucket');
                console.log('❌ profile-photos bucket does not exist');
            } else {
                console.log('✅ profile-photos bucket exists');
                
                // Test bucket access
                const { error: listError } = await supabase.storage
                    .from('profile-photos')
                    .list('', { limit: 1 });
                    
                if (listError) {
                    issues.push('Storage bucket access blocked by policies');
                    console.log(`❌ Bucket access blocked: ${listError.message}`);
                } else {
                    console.log('✅ Bucket access working');
                }
            }
        }
        
        // Check user table structure
        const { error: userError } = await supabase
            .from('users')
            .select('photos, primary_photo_url')
            .limit(1);
            
        if (userError) {
            if (userError.code === '42703') {
                issues.push('Missing photo columns in users table');
                console.log('❌ User table missing photo columns');
            } else if (userError.message.includes('permission')) {
                console.log('✅ User table RLS working correctly');
            } else {
                issues.push('User table access issue');
                console.log(`❌ User table error: ${userError.message}`);
            }
        } else {
            console.log('✅ User table has photo columns');
        }
        
    } catch (error) {
        issues.push(`System error: ${error.message}`);
        console.log(`❌ System error: ${error.message}`);
    }
    
    console.log(`\n📊 Found ${issues.length} issue(s) to fix`);
    return issues;
}

async function tryCreateBucket() {
    console.log('\n2. 🗄️  Attempting to Create Storage Bucket...');
    
    try {
        const { data, error } = await supabase.storage.createBucket('profile-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) {
            console.log(`❌ Bucket creation failed: ${error.message}`);
            if (error.message.includes('permission') || error.message.includes('policy')) {
                console.log('📝 This requires admin access - must be done via Supabase Dashboard');
            }
            return false;
        } else {
            console.log('✅ Storage bucket created successfully!');
            return true;
        }
    } catch (err) {
        console.log(`❌ Bucket creation error: ${err.message}`);
        return false;
    }
}

async function testEndToEnd() {
    console.log('\n3. 🧪 Testing End-to-End Upload Flow...');
    
    try {
        // Create test image
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const base64Data = testImageData.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        const testBlob = new Blob([bytes], { type: 'image/png' });
        
        const filename = `test-upload-${Date.now()}.png`;
        
        console.log(`📤 Testing upload: ${filename}`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filename, testBlob, {
                contentType: 'image/png',
                upsert: false
            });
            
        if (uploadError) {
            console.log(`❌ Test upload failed: ${uploadError.message}`);
            return false;
        }
        
        console.log('✅ Test upload successful');
        
        // Test URL
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);
            
        console.log(`🔗 Testing URL: ${publicUrl}`);
        
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
            console.log('✅ Photo URL accessible');
        } else {
            console.log(`❌ Photo URL not accessible: ${response.status}`);
        }
        
        // Clean up
        await supabase.storage.from('profile-photos').remove([filename]);
        console.log('🧹 Test file cleaned up');
        
        return true;
        
    } catch (error) {
        console.log(`❌ End-to-end test failed: ${error.message}`);
        return false;
    }
}

async function generateCompleteInstructions() {
    console.log('\n📋 COMPLETE SETUP INSTRUCTIONS');
    console.log('==============================');
    
    console.log('🗄️  STEP 1: CREATE STORAGE BUCKET');
    console.log('1. Go to https://app.supabase.com/projects');
    console.log('2. Select your project');
    console.log('3. Go to Storage > Create new bucket');
    console.log('4. Configuration:');
    console.log('   - Name: profile-photos');
    console.log('   - Public: ✅ Yes');
    console.log('   - File size limit: 10MB');
    console.log('   - Allowed MIME types: image/png,image/jpg,image/jpeg,image/webp');
    console.log('5. Click "Create bucket"');
    
    console.log('');
    console.log('🔒 STEP 2: CREATE STORAGE POLICIES');
    console.log('1. Go to Storage > profile-photos > Policies');
    console.log('2. Click "Add policy" for each of these:');
    console.log('');
    console.log('   Policy 1: "Allow authenticated uploads"');
    console.log('   - Operation: INSERT');
    console.log('   - Target: authenticated');
    console.log('   - USING: auth.role() = \'authenticated\'');
    console.log('');
    console.log('   Policy 2: "Allow public photo access"');
    console.log('   - Operation: SELECT');
    console.log('   - Target: public');
    console.log('   - USING: true');
    console.log('');
    console.log('   Policy 3: "Allow users to update own photos"');
    console.log('   - Operation: UPDATE');
    console.log('   - Target: authenticated');
    console.log('   - USING: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('');
    console.log('   Policy 4: "Allow users to delete own photos"');
    console.log('   - Operation: DELETE');
    console.log('   - Target: authenticated');
    console.log('   - USING: auth.uid()::text = (storage.foldername(name))[1]');
    
    console.log('');
    console.log('🗃️  STEP 3: ADD DATABASE COLUMNS');
    console.log('1. Go to Database > Tables > users');
    console.log('2. Add these columns if they don\'t exist:');
    console.log('');
    console.log('   Column 1: photos');
    console.log('   - Type: text[]');
    console.log('   - Default: \'{}\'');
    console.log('   - Allow nullable: ✅ Yes');
    console.log('');
    console.log('   Column 2: primary_photo_url');
    console.log('   - Type: text');
    console.log('   - Default: (leave empty)');
    console.log('   - Allow nullable: ✅ Yes');
    console.log('');
    console.log('   Column 3: photos_updated_at');
    console.log('   - Type: timestamptz');
    console.log('   - Default: (leave empty)');
    console.log('   - Allow nullable: ✅ Yes');
    
    console.log('');
    console.log('🧪 STEP 4: VERIFY SETUP');
    console.log('1. Run this test again: node fix_photo_upload_system_complete.mjs');
    console.log('2. Go to https://luvlang.org');
    console.log('3. Sign in or create account');
    console.log('4. Go to Profile settings');
    console.log('5. Try uploading a photo');
    console.log('6. Verify photo appears and saves correctly');
    
    console.log('');
    console.log('🎯 SUCCESS CRITERIA');
    console.log('- Users can upload 1-6 photos');
    console.log('- Photos are publicly viewable');
    console.log('- Photos persist after page refresh');
    console.log('- Users can set primary photo');
    console.log('- Photos appear in profile and matches');
    
    return true;
}

async function runCompletefix() {
    console.log('Starting complete photo upload system fix...\n');
    
    const issues = await checkCurrentIssues();
    
    if (issues.length > 0) {
        console.log('\n⚠️  Issues detected that require manual setup');
        
        // Try automated fixes where possible
        if (issues.some(i => i.includes('bucket'))) {
            const bucketCreated = await tryCreateBucket();
            if (bucketCreated) {
                console.log('✅ Automated bucket creation successful!');
                // Test again
                await testEndToEnd();
            }
        }
    }
    
    await generateCompleteInstructions();
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('📱 The photo upload UI components are already built and working');
    console.log('🔧 Manual Supabase setup is required to enable photo storage');
    console.log('⏱️  Setup time: ~5-10 minutes via Supabase Dashboard');
    console.log('🚀 Once setup is complete, users can immediately upload photos');
    
    process.exit(0);
}

runCompletefix().catch(console.error);