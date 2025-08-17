#!/usr/bin/env node

/**
 * Final Photo Upload Test Script
 * Tests the complete photo upload flow for luvlang.org
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Starting Final Photo Upload Test for luvlang.org');
console.log('=' .repeat(60));

async function testPhotoUpload() {
    try {
        // Test 1: Check if profile-photos bucket exists
        console.log('1. Testing storage bucket accessibility...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.error('❌ Error accessing buckets:', bucketError.message);
            return false;
        }
        
        const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos');
        if (!profilePhotosBucket) {
            console.error('❌ profile-photos bucket not found');
            return false;
        }
        
        console.log('✅ profile-photos bucket found');

        // Test 2: Create a test image file
        console.log('\n2. Creating test image file...');
        const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        const testFileName = `test-upload-${Date.now()}.png`;
        
        // Test 3: Upload test image
        console.log('3. Testing file upload...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(testFileName, testImageData, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload failed:', uploadError.message);
            
            // Check for RLS policy issues
            if (uploadError.message.includes('policy')) {
                console.log('\n🔍 Checking RLS policies...');
                const { data: policies, error: policyError } = await supabase
                    .from('pg_policies')
                    .select('*')
                    .eq('tablename', 'objects');
                
                if (policyError) {
                    console.log('⚠️  Cannot check policies directly');
                } else {
                    console.log('📋 Found policies:', policies?.length || 0);
                }
            }
            return false;
        }

        console.log('✅ File uploaded successfully');
        console.log('📁 Upload path:', uploadData.path);

        // Test 4: Get public URL
        console.log('\n4. Testing public URL generation...');
        const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(testFileName);

        if (urlData.publicUrl) {
            console.log('✅ Public URL generated:', urlData.publicUrl);
        } else {
            console.log('⚠️  No public URL generated');
        }

        // Test 5: List files in bucket
        console.log('\n5. Testing file listing...');
        const { data: files, error: listError } = await supabase.storage
            .from('profile-photos')
            .list('', { limit: 5 });

        if (listError) {
            console.error('❌ Error listing files:', listError.message);
        } else {
            console.log('✅ Files in bucket:', files.length);
            files.forEach(file => {
                console.log(`  📄 ${file.name} (${file.metadata?.size || 'unknown size'})`);
            });
        }

        // Test 6: Clean up test file
        console.log('\n6. Cleaning up test file...');
        const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([testFileName]);

        if (deleteError) {
            console.log('⚠️  Warning: Could not delete test file:', deleteError.message);
        } else {
            console.log('✅ Test file cleaned up');
        }

        return true;

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function testDatabaseConnection() {
    console.log('\n7. Testing database connection...');
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
}

async function runAllTests() {
    const storageTest = await testPhotoUpload();
    const dbTest = await testDatabaseConnection();
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL TEST RESULTS:');
    console.log('=' .repeat(60));
    console.log(`Storage Upload: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Database Access: ${dbTest ? '✅ PASS' : '❌ FAIL'}`);
    
    if (storageTest && dbTest) {
        console.log('\n🎉 All tests passed! Photo upload should work on luvlang.org');
        console.log('\n📝 To test on the live site:');
        console.log('   1. Go to https://luvlang.org');
        console.log('   2. Log in or create an account');
        console.log('   3. Navigate to Dashboard');
        console.log('   4. Click "Start Profile Setup"');
        console.log('   5. Upload photos in the ExecutiveProfileForm');
    } else {
        console.log('\n❌ Some tests failed. Photo upload may not work properly.');
    }
}

// Run the tests
runAllTests().catch(console.error);