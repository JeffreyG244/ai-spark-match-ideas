#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 FIXING LUVLANG.ORG PHOTO UPLOAD SYSTEM');
console.log('========================================\n');

async function fixDatabaseSchema() {
  console.log('1. 🗃️  Fixing Database Schema...');
  
  try {
    // Try to run basic schema fixes using RPC or raw SQL
    const { data, error } = await supabase.rpc('fix_photo_upload_schema');
    
    if (error) {
      if (error.code === '42883') {
        console.log('⚠️  RPC function not found, creating manual SQL fix...');
        
        // Try basic column add using direct queries
        const { error: alterError } = await supabase
          .from('users')
          .select('photos')
          .limit(1);
        
        if (alterError && alterError.code === '42703') {
          console.log('❌ photos column missing - requires manual database fix');
          console.log('📝 Please run this SQL in Supabase SQL Editor:');
          console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT \'{}\';');
          console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;');
          console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS photos_updated_at TIMESTAMPTZ DEFAULT NOW();');
          return false;
        } else {
          console.log('✅ photos column exists or accessible');
          return true;
        }
      } else {
        console.log(`❌ Schema fix failed: ${error.message}`);
        return false;
      }
    } else {
      console.log('✅ Database schema fix completed');
      return true;
    }
  } catch (err) {
    console.log(`❌ Schema fix error: ${err.message}`);
    return false;
  }
}

async function ensureStorageBucket() {
  console.log('\n2. 🗄️  Ensuring Storage Bucket Exists...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log(`❌ Cannot list buckets: ${listError.message}`);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'profile-photos');
    
    if (bucketExists) {
      console.log('✅ profile-photos bucket already exists');
      return true;
    }
    
    // Try to create bucket
    console.log('📁 Creating profile-photos bucket...');
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.log(`❌ Bucket creation failed: ${error.message}`);
      if (error.message.includes('policy')) {
        console.log('📝 This requires admin privileges in Supabase Dashboard');
        console.log('   Go to: Storage > Create new bucket > "profile-photos"');
        console.log('   Settings: Public = true, File size limit = 10MB');
      }
      return false;
    } else {
      console.log('✅ profile-photos bucket created successfully');
      return true;
    }
  } catch (err) {
    console.log(`❌ Bucket setup error: ${err.message}`);
    return false;
  }
}

async function testStorageAccess() {
  console.log('\n3. 🔒 Testing Storage Access...');
  
  try {
    // Test if we can list files (to check policies)
    const { data: files, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('❌ Storage policies need configuration');
        console.log('📝 Required Supabase Storage Policies for "profile-photos":');
        console.log('   1. INSERT policy: Allow authenticated users to upload');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.role() = \'authenticated\'');
        console.log('   2. SELECT policy: Allow public viewing');
        console.log('      - Target: public');
        console.log('      - USING: true');
        console.log('   3. UPDATE policy: Allow users to update their own files');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
        console.log('   4. DELETE policy: Allow users to delete their own files');
        console.log('      - Target: authenticated');
        console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
        return false;
      } else {
        console.log(`❌ Storage access error: ${error.message}`);
        return false;
      }
    } else {
      console.log('✅ Storage access working correctly');
      return true;
    }
  } catch (err) {
    console.log(`❌ Storage test error: ${err.message}`);
    return false;
  }
}

async function performTestUpload() {
  console.log('\n4. 📤 Testing Upload Functionality...');
  
  try {
    // Create a minimal test image (1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const base64Data = testImageData.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const testBlob = new Blob([bytes], { type: 'image/png' });
    
    const testFilename = `system-test/test-${Date.now()}.png`;
    
    console.log(`📝 Uploading test file: ${testFilename}`);
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFilename, testBlob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.log(`❌ Test upload failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Test upload successful');
    
    // Test URL generation
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(testFilename);
    
    console.log(`🔗 Test URL: ${publicUrl}`);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('profile-photos')
      .remove([testFilename]);
    
    if (deleteError) {
      console.log(`⚠️  Test cleanup failed: ${deleteError.message}`);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Test upload error: ${err.message}`);
    return false;
  }
}

async function generateSummary(results) {
  console.log('\n🎯 SUMMARY & NEXT STEPS');
  console.log('========================');
  
  const working = Object.values(results).every(r => r);
  
  if (working) {
    console.log('🎉 SUCCESS! Photo upload system is now working correctly.');
    console.log('✅ All components are functioning:');
    console.log('   - Database schema with photos column');
    console.log('   - Storage bucket "profile-photos" exists');
    console.log('   - Storage policies allow proper access');
    console.log('   - Upload functionality tested successfully');
    console.log('');
    console.log('💡 Your users should now be able to upload photos without issues!');
  } else {
    const issues = Object.entries(results)
      .filter(([key, value]) => !value)
      .map(([key, value]) => key);
    
    console.log(`❗ Found ${issues.length} issue(s) that need manual attention:`);
    issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
    
    console.log('');
    console.log('🛠️  REQUIRED MANUAL FIXES:');
    
    if (!results.database) {
      console.log('');
      console.log('🗃️  DATABASE SCHEMA FIX:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run this SQL:');
      console.log(`
-- Add photos columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photos_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_photos ON users USING GIN(photos);
CREATE INDEX IF NOT EXISTS idx_users_primary_photo ON users(primary_photo_url);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      `);
    }
    
    if (!results.bucket) {
      console.log('');
      console.log('🗄️  STORAGE BUCKET CREATION:');
      console.log('1. Go to Supabase Dashboard > Storage');
      console.log('2. Click "Create new bucket"');
      console.log('3. Name: "profile-photos"');
      console.log('4. Public: ✅ Yes');
      console.log('5. File size limit: 10MB');
      console.log('6. Allowed MIME types: image/png, image/jpg, image/jpeg, image/webp');
    }
    
    if (!results.policies) {
      console.log('');
      console.log('🔒 STORAGE POLICIES SETUP:');
      console.log('1. Go to Supabase Dashboard > Storage > profile-photos > Policies');
      console.log('2. Create these 4 policies:');
      console.log('   a) INSERT: "Allow authenticated uploads"');
      console.log('      - Target: authenticated');
      console.log('      - USING: auth.role() = \'authenticated\'');
      console.log('   b) SELECT: "Allow public photo access"');
      console.log('      - Target: public');
      console.log('      - USING: true');
      console.log('   c) UPDATE: "Allow users to update own photos"');
      console.log('      - Target: authenticated');  
      console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
      console.log('   d) DELETE: "Allow users to delete own photos"');
      console.log('      - Target: authenticated');
      console.log('      - USING: auth.uid()::text = (storage.foldername(name))[1]');
    }
  }
}

// Run all fixes
async function runFixes() {
  const results = {
    database: await fixDatabaseSchema(),
    bucket: await ensureStorageBucket(),
    policies: false,
    upload: false
  };
  
  if (results.bucket) {
    results.policies = await testStorageAccess();
    
    if (results.policies) {
      results.upload = await performTestUpload();
    }
  }
  
  await generateSummary(results);
  
  // Exit with appropriate code
  const success = Object.values(results).every(r => r);
  process.exit(success ? 0 : 1);
}

runFixes().catch(console.error);