#!/usr/bin/env node

// Complete end-to-end test of Luvlang photo upload system
// This script tests all components of the photo upload functionality

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

console.log('🧪 LUVLANG PHOTO UPLOAD SYSTEM TEST');
console.log('===================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
    console.log('1. 🌐 Testing Supabase connection...');
    
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.log(`❌ Connection failed: ${error.message}`);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        console.log(`📍 Connected to: ${SUPABASE_URL}`);
        return true;
        
    } catch (error) {
        console.log(`❌ Connection error: ${error.message}`);
        return false;
    }
}

async function testStorageBucket() {
    console.log('\n2. 📁 Testing storage bucket...');
    
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log(`❌ Cannot list buckets: ${error.message}`);
            return false;
        }
        
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        
        if (!profileBucket) {
            console.log('❌ profile-photos bucket not found');
            console.log('💡 Create bucket: Run comprehensive_photo_upload_fix.mjs');
            return false;
        }
        
        console.log('✅ profile-photos bucket exists');
        console.log(`   Public: ${profileBucket.public ? 'Yes' : 'No'}`);
        console.log(`   Created: ${profileBucket.created_at}`);
        
        return true;
        
    } catch (error) {
        console.log(`❌ Storage test error: ${error.message}`);
        return false;
    }
}

async function testStorageAccess() {
    console.log('\n3. 🔓 Testing storage access...');
    
    try {
        const { data: files, error } = await supabase.storage
            .from('profile-photos')
            .list('', { limit: 1 });
        
        if (error) {
            console.log(`❌ Cannot access bucket: ${error.message}`);
            if (error.message.includes('policy')) {
                console.log('💡 Storage policies needed: Follow comprehensive_photo_upload_fix.mjs instructions');
            }
            return false;
        }
        
        console.log('✅ Storage bucket is accessible');
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
        // Create a test image (1x1 pixel PNG)
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const base64Data = testImageData.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        const testBlob = new Blob([bytes], { type: 'image/png' });
        
        const timestamp = Date.now();
        const testFilename = `test-upload-${timestamp}.png`;
        
        console.log(`📤 Uploading test file: ${testFilename}`);
        
        const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(testFilename, testBlob, {
                contentType: 'image/png',
                upsert: false
            });
        
        if (error) {
            console.log(`❌ Upload failed: ${error.message}`);
            if (error.message.includes('policy')) {
                console.log('💡 Upload policies needed: Create storage policies in Supabase Dashboard');
            }
            return false;
        }
        
        console.log('✅ Upload successful!');
        console.log(`   Path: ${data.path}`);
        
        return { success: true, filename: testFilename, path: data.path };
        
    } catch (error) {
        console.log(`❌ Upload test error: ${error.message}`);
        return false;
    }
}

async function testPublicUrl(filename) {
    console.log('\n5. 🔗 Testing public URL generation...');
    
    try {
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);
        
        console.log(`🔗 Generated URL: ${publicUrl}`);
        
        // Test URL accessibility
        try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            
            if (response.ok) {
                console.log('✅ URL is publicly accessible');
                console.log(`   Status: ${response.status}`);
                console.log(`   Content-Type: ${response.headers.get('content-type')}`);
                return true;
            } else {
                console.log(`❌ URL returned status: ${response.status}`);
                return false;
            }
        } catch (fetchError) {
            console.log(`❌ URL fetch error: ${fetchError.message}`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ URL test error: ${error.message}`);
        return false;
    }
}

async function testCleanup(filename) {
    console.log('\n6. 🧹 Testing file cleanup...');
    
    try {
        const { error } = await supabase.storage
            .from('profile-photos')
            .remove([filename]);
        
        if (error) {
            console.log(`❌ Cleanup failed: ${error.message}`);
            return false;
        }
        
        console.log('✅ Test file cleaned up successfully');
        return true;
        
    } catch (error) {
        console.log(`❌ Cleanup error: ${error.message}`);
        return false;
    }
}

async function testDatabaseSchema() {
    console.log('\n7. 🗃️  Testing database schema...');
    
    try {
        // Test if we can query the users table (expect RLS restriction)
        const { error } = await supabase
            .from('users')
            .select('photos, primary_photo_url')
            .limit(1);
        
        if (error) {
            if (error.code === '42703') {
                console.log('❌ Photo columns missing from users table');
                console.log('💡 Run database setup: node setup_database_schema.mjs');
                return false;
            } else if (error.code === '42501' || error.message.includes('permission')) {
                console.log('✅ Photo columns exist (access restricted by RLS policies)');
                return true;
            } else {
                console.log(`❌ Database error: ${error.message}`);
                return false;
            }
        }
        
        console.log('✅ Photo columns exist and are accessible');
        return true;
        
    } catch (error) {
        console.log(`❌ Schema test error: ${error.message}`);
        return false;
    }
}

async function generateFinalReport(results) {
    console.log('\n📊 COMPLETE SYSTEM STATUS REPORT');
    console.log('=================================');
    
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
    
    console.log('\n🎯 FINAL RESULT:');
    console.log('================');
    
    if (allWorking) {
        console.log('🎉 SUCCESS! Photo upload system is FULLY FUNCTIONAL!');
        console.log('');
        console.log('✅ Users can now upload photos on luvlang.org');
        console.log('✅ Photos will be stored securely in Supabase');
        console.log('✅ Photos will be publicly accessible via URLs');
        console.log('✅ Database is configured for photo metadata');
        console.log('');
        console.log('🚀 Ready for production use!');
    } else {
        console.log('⚠️  Photo upload system needs attention');
        console.log('');
        
        const failedComponents = components.filter(c => !c.status);
        console.log('❌ Failed components:');
        failedComponents.forEach(component => {
            console.log(`   • ${component.name}`);
        });
        
        console.log('');
        console.log('🛠️  NEXT STEPS:');
        
        if (!results.bucket) {
            console.log('1. Run: node comprehensive_photo_upload_fix.mjs');
            console.log('   (Creates storage bucket and guides through setup)');
        }
        
        if (!results.database) {
            console.log('2. Run: node setup_database_schema.mjs');
            console.log('   (Sets up database schema for photos)');
        }
        
        if (!results.access || !results.upload) {
            console.log('3. Create storage policies in Supabase Dashboard');
            console.log('   (Follow instructions from comprehensive_photo_upload_fix.mjs)');
        }
        
        console.log('4. Run this test again to verify fixes');
    }
    
    return allWorking;
}

async function main() {
    console.log('Starting comprehensive photo upload system test...\n');
    
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
    results.connection = await testSupabaseConnection();
    
    if (results.connection) {
        results.bucket = await testStorageBucket();
        results.database = await testDatabaseSchema();
        
        if (results.bucket) {
            results.access = await testStorageAccess();
            
            if (results.access) {
                const uploadResult = await testPhotoUpload();
                if (uploadResult && uploadResult.success) {
                    results.upload = true;
                    results.publicUrl = await testPublicUrl(uploadResult.filename);
                    results.cleanup = await testCleanup(uploadResult.filename);
                }
            }
        }
    }
    
    // Generate final report
    const systemWorking = await generateFinalReport(results);
    
    return systemWorking;
}

main()
    .then(success => {
        console.log(`\n🏁 Test completed with ${success ? 'SUCCESS' : 'ISSUES'}`);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Test failed with critical error:', error);
        process.exit(1);
    });