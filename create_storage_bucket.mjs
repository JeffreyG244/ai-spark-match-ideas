#!/usr/bin/env node

/**
 * Create Storage Bucket Script
 * Creates the missing profile-photos bucket for luvlang.org
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🗂️  Storage Bucket Setup for luvlang.org');
console.log('=' .repeat(50));

async function checkAndCreateBuckets() {
    try {
        // List existing buckets
        console.log('1. Checking existing buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            return false;
        }
        
        console.log('📋 Existing buckets:');
        buckets.forEach(bucket => {
            console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
        
        // Check if profile-photos bucket exists
        const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos');
        
        if (profilePhotosBucket) {
            console.log('\n✅ profile-photos bucket already exists');
            return true;
        }
        
        // Create the profile-photos bucket
        console.log('\n2. Creating profile-photos bucket...');
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('profile-photos', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            fileSizeLimit: 5242880, // 5MB
        });
        
        if (createError) {
            console.error('❌ Error creating bucket:', createError.message);
            
            // Note: Only service role can create buckets
            if (createError.message.includes('permission') || createError.message.includes('policy')) {
                console.log('\n📝 Note: Bucket creation requires service role permissions.');
                console.log('   You may need to create this bucket manually in the Supabase Dashboard.');
                console.log('   Go to: https://supabase.com/dashboard/project/tzskjzkolyiwhijslqmq/storage/buckets');
                console.log('   Create a new bucket named "profile-photos" with public access.');
            }
            return false;
        }
        
        console.log('✅ profile-photos bucket created successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function testBucketAccess() {
    console.log('\n3. Testing bucket access...');
    
    try {
        const { data: files, error } = await supabase.storage
            .from('profile-photos')
            .list('', { limit: 1 });
        
        if (error) {
            console.error('❌ Cannot access bucket:', error.message);
            return false;
        }
        
        console.log('✅ Bucket is accessible');
        return true;
        
    } catch (error) {
        console.error('❌ Error testing bucket access:', error.message);
        return false;
    }
}

async function runSetup() {
    const bucketSetup = await checkAndCreateBuckets();
    const bucketAccess = await testBucketAccess();
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SETUP RESULTS:');
    console.log('=' .repeat(50));
    console.log(`Bucket Setup: ${bucketSetup ? '✅ COMPLETE' : '❌ FAILED'}`);
    console.log(`Bucket Access: ${bucketAccess ? '✅ WORKING' : '❌ NOT WORKING'}`);
    
    if (bucketSetup && bucketAccess) {
        console.log('\n🎉 Storage setup complete! Photo uploads should work now.');
    } else {
        console.log('\n❌ Setup incomplete. Manual intervention may be required.');
        console.log('\n📝 Manual steps:');
        console.log('   1. Go to Supabase Dashboard');
        console.log('   2. Navigate to Storage > Buckets');
        console.log('   3. Create "profile-photos" bucket with public access');
        console.log('   4. Set appropriate RLS policies');
    }
}

// Run the setup
runSetup().catch(console.error);