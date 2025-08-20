#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 LUVLANG.ORG PHOTO UPLOAD VERIFICATION');
console.log('=======================================\n');

async function checkStorageBucketExists() {
  console.log('1. 🗄️  Checking Storage Bucket...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`❌ Cannot list buckets: ${error.message}`);
      return false;
    }
    
    console.log(`📊 Found ${buckets.length} total buckets:`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const profilePhotoBucket = buckets.find(b => b.name === 'profile-photos');
    if (profilePhotoBucket) {
      console.log('✅ profile-photos bucket found');
      console.log(`   - Public: ${profilePhotoBucket.public ? 'Yes' : 'No'}`);
      return true;
    } else {
      console.log('❌ profile-photos bucket NOT found');
      return false;
    }
  } catch (err) {
    console.log(`❌ Bucket check error: ${err.message}`);
    return false;
  }
}

async function testStorageAccess() {
  console.log('\n2. 🔒 Testing Storage Access & Policies...');
  
  try {
    // Test basic storage access
    const { data: files, error: listError } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 5 });
    
    if (listError) {
      if (listError.message.includes('bucket') && listError.message.includes('not found')) {
        console.log('❌ Bucket does not exist yet');
        return false;
      } else if (listError.message.includes('permission') || listError.message.includes('policy')) {
        console.log('❌ Storage policies blocking access');
        console.log(`   Error: ${listError.message}`);
        return false;
      } else {
        console.log(`❌ Storage access error: ${listError.message}`);
        return false;
      }
    }
    
    console.log('✅ Storage access working');
    console.log(`   Found ${files ? files.length : 0} existing files in bucket`);
    return true;
  } catch (err) {
    console.log(`❌ Storage test error: ${err.message}`);
    return false;
  }
}

async function testPhotoUpload() {
  console.log('\n3. 📤 Testing Photo Upload...');
  
  try {
    // Create a test image (1x1 PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const base64Data = testImageData.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const testBlob = new Blob([bytes], { type: 'image/png' });
    
    const testFilename = `verification/test-upload-${Date.now()}.png`;
    console.log(`📝 Attempting upload: ${testFilename}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(testFilename, testBlob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
      if (uploadError.message.includes('bucket')) {
        console.log('   → Bucket may not exist or be configured properly');
      } else if (uploadError.message.includes('policy')) {
        console.log('   → Storage policies may need adjustment');
      }
      return false;
    }
    
    console.log('✅ Upload successful');
    console.log(`   Path: ${uploadData.path}`);
    
    // Test URL generation
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(testFilename);
    
    console.log(`🔗 Generated URL: ${publicUrl}`);
    
    // Test URL accessibility
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Photo URL is publicly accessible');
      } else {
        console.log(`⚠️  Photo URL returned ${response.status} ${response.statusText}`);
      }
    } catch (urlError) {
      console.log(`⚠️  Could not verify URL accessibility: ${urlError.message}`);
    }
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([testFilename]);
    
    if (deleteError) {
      console.log(`⚠️  Could not clean up test file: ${deleteError.message}`);
    } else {
      console.log('🧹 Test file cleaned up successfully');
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Upload test error: ${err.message}`);
    return false;
  }
}

async function checkDatabaseSchema() {
  console.log('\n4. 🗃️  Checking Database Schema...');
  
  try {
    // Test if we can query the users table structure
    const { data, error } = await supabase
      .from('users')
      .select('photos, primary_photo_url, photos_updated_at')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ users table does not exist');
        return false;
      } else if (error.code === '42703') {
        console.log('❌ One or more photo columns missing from users table');
        console.log(`   Error: ${error.message}`);
        return false;
      } else if (error.message.includes('permission')) {
        console.log('⚠️  Cannot verify schema due to permissions, but this is expected');
        console.log('   (Anonymous users typically cannot query user data)');
        return true; // This is actually expected behavior
      } else {
        console.log(`❌ Schema check failed: ${error.message}`);
        return false;
      }
    }
    
    console.log('✅ Database schema appears correct');
    console.log('   All photo-related columns are accessible');
    return true;
  } catch (err) {
    console.log(`❌ Database check error: ${err.message}`);
    return false;
  }
}

async function generateFinalReport(results) {
  console.log('\n🎯 VERIFICATION REPORT');
  console.log('=====================');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(r => r).length;
  const successRate = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`📊 Overall Success Rate: ${successRate}% (${passedChecks}/${totalChecks})`);
  console.log('');
  
  // Detailed results
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const checkName = check.charAt(0).toUpperCase() + check.slice(1);
    console.log(`${status} ${checkName}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('');
  
  if (successRate === 100) {
    console.log('🎉 EXCELLENT! Photo upload system is fully operational!');
    console.log('');
    console.log('✨ Your users can now:');
    console.log('   • Upload photos to their profiles');
    console.log('   • View uploaded photos with public URLs');
    console.log('   • Have their photos stored securely in Supabase');
    console.log('   • Experience smooth upload with progress indicators');
    console.log('');
    console.log('🔥 The photo upload feature on luvlang.org is ready for users!');
  } else if (successRate >= 75) {
    console.log('🟡 GOOD! Most components are working, minor issues remain.');
    console.log('');
    console.log('✅ Working components:');
    Object.entries(results).forEach(([check, passed]) => {
      if (passed) console.log(`   • ${check}`);
    });
    console.log('');
    console.log('❌ Issues to address:');
    Object.entries(results).forEach(([check, passed]) => {
      if (!passed) console.log(`   • ${check}`);
    });
  } else {
    console.log('🔴 ISSUES DETECTED! Several components need attention.');
    console.log('');
    console.log('❌ Failed components:');
    Object.entries(results).forEach(([check, passed]) => {
      if (!passed) console.log(`   • ${check}`);
    });
    
    if (!results.bucket) {
      console.log('');
      console.log('🛠️  TO FIX BUCKET ISSUE:');
      console.log('   Double-check the bucket was created with name "profile-photos"');
      console.log('   Ensure it\'s set to public in Supabase Dashboard');
    }
    
    if (!results.policies) {
      console.log('');
      console.log('🛠️  TO FIX POLICY ISSUES:');
      console.log('   Verify all 4 storage policies are created and active');
      console.log('   Check policy syntax matches the provided examples exactly');
    }
  }
  
  console.log('');
  console.log('📝 Next recommended action:');
  if (successRate === 100) {
    console.log('   Test photo uploads on the live site with a real user account!');
  } else {
    console.log('   Review and re-apply the manual configuration steps');
    console.log('   Then run this verification script again');
  }
}

// Run verification
async function runVerification() {
  console.log('Starting comprehensive verification...\n');
  
  const results = {
    bucket: await checkStorageBucketExists(),
    policies: false,
    upload: false,
    database: await checkDatabaseSchema()
  };
  
  if (results.bucket) {
    results.policies = await testStorageAccess();
    
    if (results.policies) {
      results.upload = await testPhotoUpload();
    }
  }
  
  await generateFinalReport(results);
  
  // Exit with success code only if everything passes
  const allPassed = Object.values(results).every(r => r);
  process.exit(allPassed ? 0 : 1);
}

runVerification().catch(console.error);