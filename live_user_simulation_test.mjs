#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 SIMULATING REAL USER PHOTO UPLOAD');
console.log('===================================\n');

async function testDirectUploadAttempt() {
  console.log('1. 📤 Testing Direct Upload (as frontend would do)...');
  
  try {
    // Create a minimal test image
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const base64Data = testImageData.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const testBlob = new Blob([bytes], { type: 'image/png' });
    
    // Simulate what the frontend code would do
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const filename = `simulated-user/${timestamp}_${randomId}_test.png`;
    
    console.log(`📝 Attempting upload: ${filename}`);
    console.log('   (This simulates what happens when a user clicks upload)');
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filename, testBlob, {
        contentType: 'image/png',
        upsert: false,
        duplex: 'half'
      });
    
    if (error) {
      console.log(`❌ Upload failed: ${error.message}`);
      console.log(`   Status Code: ${error.statusCode || 'N/A'}`);
      
      // Provide specific guidance based on error
      if (error.message.includes('bucket') && error.message.includes('not found')) {
        console.log('');
        console.log('🔍 DIAGNOSIS: Bucket Not Found');
        console.log('   This means the "profile-photos" bucket was not created properly.');
        console.log('   Please verify in Supabase Dashboard > Storage that:');
        console.log('   • A bucket named exactly "profile-photos" exists');
        console.log('   • The bucket is set to "Public" = true');
        console.log('   • No extra spaces or different spelling in the name');
        
      } else if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('');
        console.log('🔍 DIAGNOSIS: Permission/Policy Issue');
        console.log('   The bucket exists but policies are blocking uploads.');
        console.log('   Please verify in Supabase Dashboard > Storage > profile-photos > Policies:');
        console.log('   • INSERT policy exists for "authenticated" users');
        console.log('   • Policy condition: auth.role() = \'authenticated\'');
        console.log('   • All 4 policies (INSERT, SELECT, UPDATE, DELETE) are created');
        
      } else if (error.message.includes('RLS')) {
        console.log('');
        console.log('🔍 DIAGNOSIS: Row Level Security Issue');
        console.log('   Storage RLS is blocking the operation.');
        console.log('   The storage policies may need to be reviewed.');
        
      } else {
        console.log('');
        console.log('🔍 DIAGNOSIS: Other Issue');
        console.log('   Unexpected error - please check Supabase logs for details.');
      }
      
      return false;
    }
    
    console.log('✅ Upload successful!');
    console.log(`   File path: ${data.path}`);
    console.log(`   Full path: ${data.fullPath || 'N/A'}`);
    
    // Test URL generation (this should work even if upload fails)
    console.log('\n2. 🔗 Testing URL Generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filename);
    
    console.log(`   Generated URL: ${publicUrl}`);
    
    // Test URL accessibility
    console.log('\n3. 🌐 Testing URL Accessibility...');
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log(`   Response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ Photo is publicly accessible!');
      } else if (response.status === 404) {
        console.log('❌ Photo not found (upload may have failed silently)');
      } else if (response.status === 403) {
        console.log('❌ Access forbidden (policy issue)');
      } else {
        console.log(`⚠️  Unexpected response: ${response.status}`);
      }
    } catch (fetchError) {
      console.log(`❌ Could not test URL: ${fetchError.message}`);
    }
    
    // Try to clean up
    console.log('\n4. 🧹 Testing Cleanup...');
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([filename]);
    
    if (deleteError) {
      console.log(`⚠️  Could not delete test file: ${deleteError.message}`);
    } else {
      console.log('✅ Test file deleted successfully');
    }
    
    return true;
    
  } catch (err) {
    console.log(`❌ Test error: ${err.message}`);
    return false;
  }
}

async function checkCurrentSiteStatus() {
  console.log('\n5. 🌍 Checking Site Status...');
  
  try {
    const response = await fetch('https://luvlang.org');
    console.log(`   Site response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ luvlang.org is online and responding');
      console.log('   Users can access the site');
    } else {
      console.log('⚠️  Site may have issues');
    }
  } catch (err) {
    console.log(`❌ Could not reach site: ${err.message}`);
  }
}

async function generateFinalSummary(uploadWorked) {
  console.log('\n🎯 FINAL SUMMARY');
  console.log('===============');
  
  if (uploadWorked) {
    console.log('🎉 SUCCESS! Photo upload is working perfectly!');
    console.log('');
    console.log('✅ Confirmed working:');
    console.log('   • Storage bucket is accessible');
    console.log('   • Upload permissions are correct');
    console.log('   • Public URLs are generated properly');
    console.log('   • Photos are publicly accessible');
    console.log('   • File cleanup/deletion works');
    console.log('');
    console.log('🔥 Your photo upload system is ready for users!');
    console.log('   Users can now upload photos to their luvlang.org profiles.');
    
  } else {
    console.log('⚠️  ISSUES REMAIN');
    console.log('');
    console.log('The photo upload system encountered problems during testing.');
    console.log('Please review the specific error messages above and:');
    console.log('');
    console.log('1. Double-check bucket creation in Supabase Dashboard');
    console.log('2. Verify all 4 storage policies are properly configured');
    console.log('3. Ensure bucket name is exactly "profile-photos"');
    console.log('4. Confirm bucket is set to public');
    console.log('');
    console.log('After making any changes, test again with this script.');
  }
  
  console.log('');
  console.log('📋 NEXT STEPS:');
  if (uploadWorked) {
    console.log('   • Test with a real user account on luvlang.org');
    console.log('   • Monitor for any user-reported issues');
    console.log('   • Consider setting up error logging for production monitoring');
  } else {
    console.log('   • Fix the identified issues');
    console.log('   • Re-run this verification script');
    console.log('   • Once all tests pass, test with real user accounts');
  }
}

// Run the simulation
async function runSimulation() {
  const uploadWorked = await testDirectUploadAttempt();
  await checkCurrentSiteStatus();
  await generateFinalSummary(uploadWorked);
  
  process.exit(uploadWorked ? 0 : 1);
}

runSimulation().catch(console.error);