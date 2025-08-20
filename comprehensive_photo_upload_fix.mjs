#!/usr/bin/env node

// Complete Luvlang Photo Upload Storage Setup Script
// This script creates the storage bucket and sets up all necessary infrastructure

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

console.log('🚀 LUVLANG PHOTO UPLOAD STORAGE SETUP');
console.log('=====================================\n');

// Try to use service role key from environment or prompt user for manual setup
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createStorageBucket() {
    console.log('📁 Setting up storage bucket...');
    
    if (!SERVICE_ROLE_KEY) {
        console.log('❌ Service role key not available');
        console.log('📋 MANUAL BUCKET CREATION REQUIRED:');
        console.log('');
        console.log('1. Go to https://app.supabase.com');
        console.log('2. Select your project: tzskjzkolyiwhijslqmq');
        console.log('3. Navigate to Storage in the left sidebar');
        console.log('4. Click "Create new bucket"');
        console.log('5. Enter these EXACT settings:');
        console.log('   ◦ Bucket name: profile-photos');
        console.log('   ◦ Public bucket: ✅ ENABLED');
        console.log('   ◦ File size limit: 10 MB');
        console.log('   ◦ Allowed MIME types: image/png,image/jpg,image/jpeg,image/webp');
        console.log('6. Click "Create bucket"');
        console.log('');
        console.log('⏯️  Press Enter after creating the bucket to continue...');
        
        // Wait for user input
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });
        
        return await verifyBucketExists();
    }
    
    // Try to create bucket with service role key
    try {
        console.log('🔑 Using service role key to create bucket...');
        const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        
        const { data, error } = await adminSupabase.storage.createBucket('profile-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
            fileSizeLimit: 10485760 // 10MB
        });
        
        if (error && !error.message.includes('already exists')) {
            throw error;
        }
        
        console.log('✅ Storage bucket created/verified successfully');
        return true;
        
    } catch (error) {
        console.log(`❌ Failed to create bucket: ${error.message}`);
        return false;
    }
}

async function verifyBucketExists() {
    console.log('\n🔍 Verifying bucket exists...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log(`❌ Cannot verify buckets: ${error.message}`);
            return false;
        }
        
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        
        if (profileBucket) {
            console.log('✅ profile-photos bucket exists');
            console.log(`   Public: ${profileBucket.public ? 'Yes' : 'No'}`);
            return true;
        } else {
            console.log('❌ profile-photos bucket not found');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Verification error: ${error.message}`);
        return false;
    }
}

async function createStoragePolicies() {
    console.log('\n🔒 Storage Policies Setup');
    console.log('Please create these policies in Supabase Dashboard:');
    console.log('Go to Storage > profile-photos > Policies\n');
    
    const policies = [
        {
            name: 'Allow authenticated uploads',
            operation: 'INSERT',
            target: 'authenticated',
            using: "auth.role() = 'authenticated'",
            withCheck: ''
        },
        {
            name: 'Allow public photo access',
            operation: 'SELECT', 
            target: 'public',
            using: 'true',
            withCheck: ''
        },
        {
            name: 'Allow users to update own photos',
            operation: 'UPDATE',
            target: 'authenticated',
            using: "auth.uid()::text = (storage.foldername(name))[1]",
            withCheck: "auth.uid()::text = (storage.foldername(name))[1]"
        },
        {
            name: 'Allow users to delete own photos',
            operation: 'DELETE',
            target: 'authenticated',
            using: "auth.uid()::text = (storage.foldername(name))[1]",
            withCheck: ''
        }
    ];
    
    policies.forEach((policy, index) => {
        console.log(`📋 POLICY ${index + 1}: ${policy.name}`);
        console.log(`   Operation: ${policy.operation}`);
        console.log(`   Target: ${policy.target}`);
        console.log(`   USING: ${policy.using}`);
        if (policy.withCheck) {
            console.log(`   WITH CHECK: ${policy.withCheck}`);
        }
        console.log('');
    });
    
    console.log('⏯️  Press Enter after creating all policies...');
    await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });
}

async function testStorageUpload() {
    console.log('\n🧪 Testing storage upload...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        // Create a test image blob
        const canvas = { width: 1, height: 1 };
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const base64Data = testImageData.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        const testBlob = new Blob([bytes], { type: 'image/png' });
        
        const testFilename = `test-${Date.now()}.png`;
        
        console.log(`📤 Uploading test file: ${testFilename}`);
        
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(testFilename, testBlob);
        
        if (error) {
            console.log(`❌ Upload failed: ${error.message}`);
            if (error.message.includes('policy')) {
                console.log('💡 This indicates storage policies need to be created');
                console.log('   Run this script again after creating the policies');
            }
            return false;
        }
        
        console.log('✅ Upload successful!');
        console.log(`   Path: ${data.path}`);
        
        // Test URL generation
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(testFilename);
        
        console.log(`🔗 Public URL: ${publicUrl}`);
        
        // Test URL accessibility
        try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log('✅ URL is accessible');
            } else {
                console.log(`⚠️  URL returned status: ${response.status}`);
            }
        } catch (urlError) {
            console.log(`⚠️  URL test failed: ${urlError.message}`);
        }
        
        // Clean up
        const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([testFilename]);
        
        if (!deleteError) {
            console.log('🧹 Test file cleaned up');
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('Starting storage setup process...\n');
    
    // Step 1: Create/verify storage bucket
    const bucketExists = await createStorageBucket();
    
    if (!bucketExists) {
        console.log('\n❌ Bucket creation failed. Please create manually and run script again.');
        process.exit(1);
    }
    
    // Step 2: Verify bucket exists
    const verified = await verifyBucketExists();
    
    if (!verified) {
        console.log('\n❌ Bucket verification failed. Please check manual creation.');
        process.exit(1);
    }
    
    // Step 3: Set up storage policies
    await createStoragePolicies();
    
    // Step 4: Test upload functionality
    const uploadWorks = await testStorageUpload();
    
    // Final status
    console.log('\n🎯 STORAGE SETUP RESULTS');
    console.log('========================');
    console.log(`✅ Bucket exists: ${verified}`);
    console.log(`${uploadWorks ? '✅' : '❌'} Upload working: ${uploadWorks}`);
    
    if (uploadWorks) {
        console.log('\n🎉 SUCCESS! Photo upload storage is ready!');
        console.log('✅ Users can now upload photos to luvlang.org');
    } else {
        console.log('\n⚠️  Storage policies still need to be created');
        console.log('📋 Complete the policy setup in Supabase Dashboard');
        console.log('🔄 Then run this script again to verify everything works');
    }
    
    return uploadWorks;
}

main()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error('❌ Critical error:', error);
        process.exit(1);
    });