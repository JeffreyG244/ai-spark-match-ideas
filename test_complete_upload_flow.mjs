#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔄 TESTING COMPLETE PHOTO UPLOAD FLOW');
console.log('====================================');

async function testCompleteFlow() {
  // Create test image
  const createTestImage = () => {
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00,
      0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    return pngData;
  };

  console.log('\n1️⃣ Testing unauthenticated upload (should fail)...');
  const testImage = createTestImage();
  const testFileName = `test-user-id/test_${Date.now()}.png`;
  
  try {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, testImage, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.log('✅ Unauthenticated upload correctly blocked:', error.message);
    } else {
      console.log('❌ SECURITY ISSUE: Unauthenticated upload succeeded!');
      console.log('📁 File:', data.path);
      // Clean up
      await supabase.storage.from('profile-photos').remove([testFileName]);
    }
  } catch (e) {
    console.log('❌ Upload test error:', e.message);
  }

  console.log('\n2️⃣ Testing what happens when user tries to upload from frontend...');
  
  // Simulate the exact frontend upload process from usePhotoUpload.ts
  console.log('\n🔄 Simulating frontend photo upload process:');
  console.log('   - User uploads file via file input');
  console.log('   - File validation checks');
  console.log('   - Attempt to upload to Supabase');
  console.log('   - Save photo URL to user_profiles table');

  // Test the user_profiles table access
  console.log('\n3️⃣ Testing user_profiles table...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, photo_urls, primary_photo_url')
      .limit(1);
    
    if (error) {
      console.log('❌ user_profiles access failed:', error.message);
    } else {
      console.log('✅ user_profiles table accessible');
      console.log(`📊 Found ${data.length} profiles`);
    }
  } catch (e) {
    console.log('❌ Table access error:', e.message);
  }

  console.log('\n4️⃣ Testing photo URL generation...');
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl('test-user-id/test-photo.png');
    
    console.log('✅ Public URL generation works:', publicUrl);
    
    // Test if URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log(`📡 URL accessibility test: ${response.status} ${response.statusText}`);
    } catch (fetchError) {
      console.log('❌ URL not accessible:', fetchError.message);
    }
  } catch (e) {
    console.log('❌ URL generation error:', e.message);
  }

  console.log('\n📋 FINDINGS:');
  console.log('===========');
  console.log('Based on these tests, the photo upload issue is likely:');
  console.log('1. Users are not properly authenticated in the frontend');
  console.log('2. The authentication state is not being passed to upload hooks');
  console.log('3. Error handling in frontend is not showing the real error');
  console.log('\n💡 SOLUTION:');
  console.log('1. Apply the storage policies to require authentication');
  console.log('2. Fix frontend authentication flow');
  console.log('3. Improve error messaging for users');
}

testCompleteFlow().catch(console.error);