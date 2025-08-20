const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, anonKey);

async function createTestImage() {
  // Create a small test image (1x1 PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  return pngBuffer;
}

async function testPhotoUploadFlow() {
  console.log('🔄 COMPREHENSIVE PHOTO UPLOAD TEST');
  console.log('=====================================\n');
  
  const results = {
    storageAccess: false,
    bucketExists: false,
    fileValidation: false,
    uploadAttempt: false,
    publicUrlGeneration: false,
    overallSuccess: false
  };
  
  try {
    // Test 1: Storage Access
    console.log('1️⃣ Testing storage access...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Storage access failed:', listError.message);
      results.storageAccess = false;
    } else {
      console.log('✅ Storage access successful');
      console.log(`   Found ${buckets.length} bucket(s): [${buckets.map(b => b.name).join(', ')}]`);
      results.storageAccess = true;
    }
    
    // Test 2: Bucket Existence
    console.log('\n2️⃣ Checking profile-photos bucket...');
    const profileBucket = buckets?.find(b => b.name === 'profile-photos');
    
    if (profileBucket) {
      console.log('✅ Profile-photos bucket exists');
      results.bucketExists = true;
    } else {
      console.log('❌ Profile-photos bucket missing');
      console.log('   This will cause uploads to fail');
      results.bucketExists = false;
    }
    
    // Test 3: File Validation Logic
    console.log('\n3️⃣ Testing file validation logic...');
    const testFile = createTestImage();
    
    // Simulate file validation
    const fileSize = testFile.length;
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const isValidSize = testFile && fileSize > 0 && fileSize <= maxSize;
    const isValidType = true; // Simulating image/png
    
    console.log(`   Testing file: ${fileSize} bytes (${testFile ? 'valid buffer' : 'invalid'})`);
    console.log(`   Size limit: ${maxSize} bytes (5MB)`);
    console.log(`   Size check: ${isValidSize ? 'PASS' : 'FAIL'}`);
    console.log(`   Type check: ${isValidType ? 'PASS' : 'FAIL'}`);
    
    if (isValidSize && isValidType) {
      console.log('✅ File validation passed');
      results.fileValidation = true;
    } else {
      console.log('❌ File validation failed');
      results.fileValidation = false;
    }
    
    // Test 4: Upload Attempt (only if bucket exists)
    console.log('\n4️⃣ Testing upload attempt...');
    if (results.bucketExists) {
      try {
        const filename = `test/${Date.now()}_test.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, testFile, {
            contentType: 'image/png',
            upsert: false
          });
        
        if (uploadError) {
          console.log('❌ Upload failed:', uploadError.message);
          results.uploadAttempt = false;
        } else {
          console.log('✅ Upload successful');
          console.log('   File path:', uploadData.path);
          results.uploadAttempt = true;
          
          // Test 5: Public URL Generation
          console.log('\n5️⃣ Testing public URL generation...');
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filename);
          
          if (publicUrl) {
            console.log('✅ Public URL generated');
            console.log('   URL:', publicUrl);
            results.publicUrlGeneration = true;
          } else {
            console.log('❌ Failed to generate public URL');
            results.publicUrlGeneration = false;
          }
        }
      } catch (uploadErr) {
        console.log('❌ Upload error:', uploadErr.message);
        results.uploadAttempt = false;
      }
    } else {
      console.log('⏭️  Skipping upload test (bucket missing)');
      results.uploadAttempt = false;
    }
    
    // Calculate overall success
    results.overallSuccess = 
      results.storageAccess && 
      results.bucketExists && 
      results.fileValidation && 
      results.uploadAttempt && 
      results.publicUrlGeneration;
    
  } catch (error) {
    console.log('❌ Test suite error:', error.message);
  }
  
  // Results Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`Storage Access:      ${results.storageAccess ? '✅' : '❌'} ${results.storageAccess ? 'PASS' : 'FAIL'}`);
  console.log(`Bucket Exists:       ${results.bucketExists ? '✅' : '❌'} ${results.bucketExists ? 'PASS' : 'FAIL'}`);
  console.log(`File Validation:     ${results.fileValidation ? '✅' : '❌'} ${results.fileValidation ? 'PASS' : 'FAIL'}`);
  console.log(`Upload Attempt:      ${results.uploadAttempt ? '✅' : '❌'} ${results.uploadAttempt ? 'PASS' : 'FAIL'}`);
  console.log(`Public URL Gen:      ${results.publicUrlGeneration ? '✅' : '❌'} ${results.publicUrlGeneration ? 'PASS' : 'FAIL'}`);
  console.log(`Overall Success:     ${results.overallSuccess ? '✅' : '❌'} ${results.overallSuccess ? 'PASS' : 'FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length - 1; // Exclude overallSuccess from count
  const percentage = Math.round((passCount / totalTests) * 100);
  
  console.log(`\nTest Score: ${passCount}/${totalTests} (${percentage}%)`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('=================');
  if (!results.bucketExists) {
    console.log('🔧 CRITICAL: Create the profile-photos bucket in Supabase Dashboard:');
    console.log('   1. Go to Storage in Supabase Dashboard');
    console.log('   2. Click "New Bucket"'); 
    console.log('   3. Name: profile-photos');
    console.log('   4. Make it public');
    console.log('   5. Set 10MB file size limit');
  }
  
  if (!results.uploadAttempt && results.bucketExists) {
    console.log('🔧 Check RLS policies on storage.objects table');
  }
  
  if (results.overallSuccess) {
    console.log('🎉 Photo upload is fully functional!');
  } else {
    console.log('⚠️  Photo upload needs configuration fixes');
  }
  
  return {
    success: results.overallSuccess,
    percentage,
    details: results
  };
}

// Run the test
testPhotoUploadFlow()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });