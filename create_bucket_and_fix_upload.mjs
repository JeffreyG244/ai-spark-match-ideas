#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔧 CREATING STORAGE BUCKET AND FIXING PHOTO UPLOAD');
console.log('==================================================');

async function createBucketAndFixUpload() {
  console.log('\n1️⃣ Creating profile-photos bucket...');
  
  try {
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        console.log('❌ Failed to create bucket:', error.message);
        return false;
      }
    } else {
      console.log('✅ Bucket created successfully');
    }
  } catch (e) {
    console.log('❌ Error creating bucket:', e.message);
    return false;
  }

  console.log('\n2️⃣ Verifying bucket exists...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Cannot list buckets:', error.message);
      return false;
    }
    
    const profilePhotoBucket = buckets.find(b => b.name === 'profile-photos');
    if (!profilePhotoBucket) {
      console.log('❌ profile-photos bucket still not found!');
      return false;
    }
    console.log('✅ profile-photos bucket confirmed');
  } catch (e) {
    console.log('❌ Verification error:', e.message);
    return false;
  }

  console.log('\n3️⃣ Testing bucket access...');
  try {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Bucket access failed:', error.message);
      return false;
    }
    console.log('✅ Bucket access working');
  } catch (e) {
    console.log('❌ Access test error:', e.message);
    return false;
  }

  console.log('\n4️⃣ Testing upload permissions...');
  try {
    const testContent = 'test file content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test_${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, testBlob);
    
    if (error) {
      console.log('⚠️ Upload test failed (may need auth):', error.message);
    } else {
      console.log('✅ Upload test successful:', data.path);
      // Clean up
      await supabase.storage.from('profile-photos').remove([testFileName]);
    }
  } catch (e) {
    console.log('❌ Upload test error:', e.message);
  }

  return true;
}

createBucketAndFixUpload()
  .then(success => {
    if (success) {
      console.log('\n✅ BUCKET SETUP COMPLETE!');
      console.log('The profile-photos bucket is now ready for photo uploads.');
      console.log('\nNext steps:');
      console.log('1. Storage policies may need to be configured in Supabase Dashboard');
      console.log('2. Test photo upload on live site');
    } else {
      console.log('\n❌ SETUP FAILED!');
      console.log('Manual intervention required in Supabase Dashboard.');
    }
  })
  .catch(console.error);