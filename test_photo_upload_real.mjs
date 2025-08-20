#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 COMPREHENSIVE PHOTO UPLOAD TEST');
console.log('==================================');

async function testEverything() {
  console.log('\n1️⃣ Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Supabase connection working');
  } catch (e) {
    console.log('❌ Connection error:', e.message);
    return;
  }

  console.log('\n2️⃣ Testing Storage Bucket Access...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Cannot list buckets:', error.message);
      return;
    }
    
    const profilePhotoBucket = buckets.find(b => b.name === 'profile-photos');
    if (!profilePhotoBucket) {
      console.log('❌ profile-photos bucket does not exist!');
      console.log('Available buckets:', buckets.map(b => b.name));
      return;
    }
    console.log('✅ profile-photos bucket exists');
  } catch (e) {
    console.log('❌ Bucket access error:', e.message);
    return;
  }

  console.log('\n3️⃣ Testing Storage Read Access...');
  try {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Storage read failed:', error.message);
      return;
    }
    console.log('✅ Storage read access working');
  } catch (e) {
    console.log('❌ Storage read error:', e.message);
    return;
  }

  console.log('\n4️⃣ Testing Upload Without Authentication...');
  try {
    const testContent = 'test file content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test_unauthenticated_${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, testBlob);
    
    if (error) {
      console.log('❌ Unauthenticated upload failed (expected):', error.message);
      if (error.message.includes('policies') || error.message.includes('permission')) {
        console.log('✅ Good - authentication is required');
      }
    } else {
      console.log('⚠️ WARNING: Unauthenticated upload succeeded - security issue!');
    }
  } catch (e) {
    console.log('❌ Upload test error:', e.message);
  }

  console.log('\n5️⃣ Testing User Profiles Table...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, photo_urls, primary_photo_url')
      .limit(1);
    
    if (error) {
      console.log('❌ user_profiles table access failed:', error.message);
      return;
    }
    console.log('✅ user_profiles table accessible');
    if (data && data.length > 0) {
      console.log('📊 Sample profile data:', data[0]);
    }
  } catch (e) {
    console.log('❌ Table access error:', e.message);
  }

  console.log('\n6️⃣ Testing Authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.log('⚠️ No authenticated user (expected for this test)');
      console.log('💡 To test authenticated upload, user needs to sign in first');
    } else {
      console.log('✅ User authenticated:', user.email);
      
      // Test authenticated upload
      console.log('\n7️⃣ Testing Authenticated Upload...');
      const testContent = 'authenticated test content';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFileName = `${user.id}/test_authenticated_${Date.now()}.txt`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(testFileName, testBlob);
      
      if (uploadError) {
        console.log('❌ Authenticated upload failed:', uploadError.message);
      } else {
        console.log('✅ Authenticated upload successful:', data.path);
        
        // Clean up test file
        await supabase.storage
          .from('profile-photos')
          .remove([testFileName]);
        console.log('🧹 Test file cleaned up');
      }
    }
  } catch (e) {
    console.log('❌ Auth test error:', e.message);
  }

  console.log('\n📋 SUMMARY');
  console.log('==========');
  console.log('If upload is not working, check:');
  console.log('1. User is properly authenticated');
  console.log('2. Storage policies allow authenticated uploads');
  console.log('3. profile-photos bucket exists and has correct policies');
  console.log('4. user_profiles table has photo_urls and primary_photo_url columns');
  console.log('5. Frontend error handling is working correctly');
}

testEverything().catch(console.error);