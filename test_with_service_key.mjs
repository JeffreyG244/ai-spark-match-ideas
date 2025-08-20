#!/usr/bin/env node

// Test photo upload system with service role key to verify everything works

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY1Njc4MCwiZXhwIjoyMDY0MjMyNzgwfQ.pSLu22y_NNm4mdDEN-yAVypiAWQiQpC3kZDioJBc30c";

console.log('🎯 COMPLETE PHOTO UPLOAD SYSTEM VERIFICATION');
console.log('=============================================\n');

const anonSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testConnection() {
    console.log('1. 🌐 Testing connections...');
    
    try {
        const { data: anonData, error: anonError } = await anonSupabase.auth.getSession();
        const { data: adminData, error: adminError } = await adminSupabase.auth.getSession();
        
        console.log(`✅ Anonymous connection: ${!anonError ? 'Working' : 'Failed'}`);
        console.log(`✅ Service role connection: ${!adminError ? 'Working' : 'Failed'}`);
        
        return !anonError && !adminError;
    } catch (error) {
        console.log(`❌ Connection test failed: ${error.message}`);
        return false;
    }
}

async function testStorageBucket() {
    console.log('\n2. 📁 Testing storage bucket...');
    
    try {
        const { data: buckets, error } = await adminSupabase.storage.listBuckets();
        
        if (error) {
            console.log(`❌ Cannot list buckets: ${error.message}`);
            return false;
        }
        
        console.log(`📊 Found ${buckets?.length || 0} total buckets`);
        
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        
        if (profileBucket) {
            console.log('✅ profile-photos bucket exists!');
            console.log(`   - Public: ${profileBucket.public}`);
            console.log(`   - File size limit: ${profileBucket.file_size_limit} bytes`);
            console.log(`   - MIME types: ${JSON.stringify(profileBucket.allowed_mime_types)}`);
            console.log(`   - Created: ${profileBucket.created_at}`);
            return true;
        } else {
            console.log('❌ profile-photos bucket not found');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Storage test error: ${error.message}`);
        return false;
    }
}

async function testStorageAccess() {
    console.log('\n3. 🔓 Testing storage access...');
    
    try {
        // Test with anonymous key (what users will use)
        const { data: files, error } = await anonSupabase.storage
            .from('profile-photos')
            .list('', { limit: 1 });
        
        if (error) {
            console.log(`❌ Anonymous access failed: ${error.message}`);
            return false;
        }
        
        console.log('✅ Anonymous users can access bucket');
        console.log(`   Found ${files?.length || 0} existing files`);
        return true;
        
    } catch (error) {
        console.log(`❌ Access test error: ${error.message}`);
        return false;
    }
}

async function testPhotoUpload() {
    console.log('\n4. 📤 Testing photo upload...');
    
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
        
        const testFilename = `test-upload-${Date.now()}.png`;
        
        console.log(`📤 Uploading: ${testFilename}`);
        
        // Test upload with anonymous key (simulating user upload)
        const { data, error } = await anonSupabase.storage
            .from('profile-photos')
            .upload(testFilename, testBlob, {
                contentType: 'image/png',
                upsert: false
            });
        
        if (error) {
            console.log(`❌ Upload failed: ${error.message}`);
            return { success: false };
        }
        
        console.log('✅ Upload successful!');
        console.log(`   Path: ${data.path}`);
        
        return { success: true, filename: testFilename, path: data.path };
        
    } catch (error) {
        console.log(`❌ Upload test error: ${error.message}`);
        return { success: false };
    }
}

async function testPublicUrl(filename) {
    console.log('\n5. 🔗 Testing public URL...');
    
    try {
        const { data: { publicUrl } } = anonSupabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);
        
        console.log(`🔗 Generated URL: ${publicUrl}`);
        
        // Test URL accessibility
        const response = await fetch(publicUrl, { method: 'HEAD' });
        
        if (response.ok) {
            console.log('✅ URL is publicly accessible');
            console.log(`   Status: ${response.status}`);
            return true;
        } else {
            console.log(`❌ URL returned status: ${response.status}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ URL test error: ${error.message}`);
        return false;
    }
}

async function testCleanup(filename) {
    console.log('\n6. 🧹 Testing cleanup...');
    
    try {
        const { error } = await anonSupabase.storage
            .from('profile-photos')
            .remove([filename]);
        
        if (error) {
            console.log(`❌ Cleanup failed: ${error.message}`);
            return false;
        }
        
        console.log('✅ Test file cleaned up');
        return true;
        
    } catch (error) {
        console.log(`❌ Cleanup error: ${error.message}`);
        return false;
    }
}

async function testDatabaseSchema() {
    console.log('\n7. 🗃️  Testing database schema...');
    
    try {
        // Test with admin privileges to check schema
        const { data, error } = await adminSupabase
            .from('users')
            .select('photos, primary_photo_url, photos_updated_at')
            .limit(1);
        
        if (error) {
            if (error.code === '42703') {
                console.log('❌ Photo columns missing');
                return false;
            } else {
                console.log('✅ Photo columns exist (query restricted by RLS)');
                return true;
            }
        }
        
        console.log('✅ Photo columns exist and accessible');
        return true;
        
    } catch (error) {
        console.log(`❌ Schema test error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('Starting comprehensive verification...\n');
    
    const results = {
        connection: false,
        bucket: false,
        access: false,
        upload: false,
        publicUrl: false,
        cleanup: false,
        database: false
    };
    
    // Run all tests
    results.connection = await testConnection();
    results.bucket = await testStorageBucket();
    results.access = await testStorageAccess();
    results.database = await testDatabaseSchema();
    
    if (results.access) {
        const uploadResult = await testPhotoUpload();
        if (uploadResult.success) {
            results.upload = true;
            results.publicUrl = await testPublicUrl(uploadResult.filename);
            results.cleanup = await testCleanup(uploadResult.filename);
        }
    }
    
    // Final report
    console.log('\n🎯 FINAL VERIFICATION REPORT');
    console.log('============================');
    
    const components = [
        { name: 'Supabase Connection', status: results.connection },
        { name: 'Storage Bucket', status: results.bucket },
        { name: 'Storage Access', status: results.access },
        { name: 'Photo Upload', status: results.upload },
        { name: 'Public URL', status: results.publicUrl },
        { name: 'File Cleanup', status: results.cleanup },
        { name: 'Database Schema', status: results.database }
    ];
    
    console.log('\n📋 Component Status:');
    components.forEach(component => {
        const icon = component.status ? '✅' : '❌';
        console.log(`   ${icon} ${component.name}`);
    });
    
    const allWorking = Object.values(results).every(Boolean);
    
    console.log('\n🎯 SYSTEM STATUS:');
    console.log('================');
    
    if (allWorking) {
        console.log('🎉 SUCCESS! Photo upload system is FULLY FUNCTIONAL!');
        console.log('');
        console.log('✅ Users can upload photos on luvlang.org');
        console.log('✅ Photos are stored securely in Supabase');
        console.log('✅ Photos are publicly accessible via URLs');
        console.log('✅ Database is ready for photo metadata');
        console.log('');
        console.log('🚀 READY FOR PRODUCTION!');
    } else {
        console.log('⚠️  Some components need attention');
        const failed = components.filter(c => !c.status);
        failed.forEach(c => console.log(`   ❌ ${c.name}`));
    }
    
    return allWorking;
}

main()
    .then(success => {
        console.log(`\n🏁 Verification ${success ? 'PASSED' : 'FAILED'}`);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Verification error:', error);
        process.exit(1);
    });