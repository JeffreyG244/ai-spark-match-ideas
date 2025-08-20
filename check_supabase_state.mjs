#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 CHECKING CURRENT SUPABASE STATE');
console.log('=================================');

async function checkSupabaseState() {
  console.log('\n📦 STORAGE BUCKETS:');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('❌ Cannot access buckets:', error.message);
    } else {
      if (buckets.length === 0) {
        console.log('📭 No storage buckets found');
      } else {
        buckets.forEach(bucket => {
          console.log(`📂 Bucket: ${bucket.name}`);
          console.log(`   - ID: ${bucket.id}`);
          console.log(`   - Public: ${bucket.public}`);
          console.log(`   - Created: ${bucket.created_at}`);
          console.log(`   - Updated: ${bucket.updated_at}`);
        });
      }
    }
  } catch (e) {
    console.log('❌ Error checking buckets:', e.message);
  }

  console.log('\n🗃️ TABLES:');
  try {
    // Check if user_profiles table exists and has photo columns
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, photo_urls, primary_photo_url')
      .limit(1);
    
    if (error) {
      console.log('❌ user_profiles table issue:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('📋 user_profiles table does not exist');
      }
    } else {
      console.log('✅ user_profiles table exists and accessible');
      if (data && data.length > 0) {
        console.log('📊 Sample data columns:', Object.keys(data[0]));
      }
    }
  } catch (e) {
    console.log('❌ Error checking tables:', e.message);
  }

  console.log('\n🔐 TESTING STORAGE ACCESS:');
  try {
    // Try to access profile-photos bucket specifically
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ profile-photos bucket access failed:', error.message);
      if (error.message.includes('not found')) {
        console.log('📭 profile-photos bucket does not exist');
      } else if (error.message.includes('policies')) {
        console.log('🔒 Bucket exists but policies are blocking access');
      }
    } else {
      console.log('✅ profile-photos bucket accessible');
      console.log(`📁 Files in bucket: ${data.length}`);
    }
  } catch (e) {
    console.log('❌ Storage access error:', e.message);
  }

  console.log('\n🔑 AUTHENTICATION STATE:');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.log('👤 No authenticated user (using anon key)');
    } else {
      console.log('✅ Authenticated user:', user.email);
    }
  } catch (e) {
    console.log('❌ Auth check error:', e.message);
  }

  console.log('\n🧪 UPLOAD TEST:');
  try {
    // Test upload with current permissions
    const testContent = `Test upload ${Date.now()}`;
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test_${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, testBlob);
    
    if (error) {
      console.log('❌ Upload test failed:', error.message);
      
      // Analyze the error
      if (error.message.includes('bucket')) {
        console.log('💡 Issue: Bucket does not exist or is not accessible');
      } else if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('💡 Issue: Storage policies are blocking uploads');
      } else if (error.message.includes('authentication')) {
        console.log('💡 Issue: Authentication required for uploads');
      } else {
        console.log('💡 Issue: Unknown error type');
      }
    } else {
      console.log('✅ Upload test successful:', data.path);
      // Clean up test file
      await supabase.storage.from('profile-photos').remove([testFileName]);
      console.log('🧹 Test file cleaned up');
    }
  } catch (e) {
    console.log('❌ Upload test error:', e.message);
  }

  console.log('\n📋 SUMMARY & RECOMMENDATIONS:');
  console.log('============================');
  console.log('Based on the above tests, here is what needs to be done:');
}

checkSupabaseState().catch(console.error);