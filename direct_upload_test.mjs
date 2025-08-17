#!/usr/bin/env node

/**
 * Direct Upload Test
 * Bypasses bucket listing and tests upload directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Direct Photo Upload Test');
console.log('=' .repeat(40));

async function testDirectUpload() {
    try {
        // Create test image
        console.log('1. Creating test image...');
        const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        const testFileName = `test-upload-${Date.now()}.png`;
        
        // Direct upload attempt
        console.log('2. Attempting direct upload...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(testFileName, testImageData, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload failed:', uploadError.message);
            console.error('   Error details:', uploadError);
            return false;
        }

        console.log('✅ Upload successful!');
        console.log('📁 File path:', uploadData.path);
        
        // Test public URL
        console.log('3. Testing public URL...');
        const { data: urlData } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(testFileName);

        console.log('🔗 Public URL:', urlData.publicUrl);
        
        // Clean up
        console.log('4. Cleaning up...');
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

console.log('Testing direct upload to profile-photos bucket...');
testDirectUpload().then(success => {
    console.log('\n' + '=' .repeat(40));
    if (success) {
        console.log('🎉 SUCCESS! Photo upload is working!');
        console.log('\n✅ The profile-photos bucket exists and is functional.');
        console.log('✅ Photo uploads should work on luvlang.org');
    } else {
        console.log('❌ Upload test failed.');
        console.log('   The profile-photos bucket may need to be created manually.');
    }
}).catch(console.error);