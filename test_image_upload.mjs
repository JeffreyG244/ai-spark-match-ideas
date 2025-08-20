#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🖼️ TESTING IMAGE UPLOAD TO PROFILE-PHOTOS BUCKET');
console.log('===============================================');

async function testImageUpload() {
  console.log('\n1️⃣ Creating test image...');
  
  // Create a simple 1x1 pixel PNG image as a test
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, // image data
    0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  console.log('✅ Test PNG created');

  console.log('\n2️⃣ Testing authenticated upload (should fail without auth)...');
  try {
    const testFileName = `test_image_${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, pngHeader, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.log('❌ Upload failed:', error.message);
      
      if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('✅ Good! Authentication is required (as expected)');
      } else if (error.message.includes('mime')) {
        console.log('⚠️ MIME type issue - bucket may not allow PNG files');
      } else {
        console.log('🤔 Unexpected error type');
      }
    } else {
      console.log('⚠️ Upload succeeded without authentication! This is a security issue.');
      console.log('📁 Uploaded to:', data.path);
      
      // Clean up
      await supabase.storage.from('profile-photos').remove([testFileName]);
    }
  } catch (e) {
    console.log('❌ Upload error:', e.message);
  }

  console.log('\n3️⃣ Testing bucket file listing...');
  try {
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 10 });
    
    if (error) {
      console.log('❌ Cannot list files:', error.message);
    } else {
      console.log(`✅ Found ${data.length} files in bucket`);
      if (data.length > 0) {
        console.log('📄 Files:');
        data.forEach(file => {
          console.log(`   - ${file.name} (${file.metadata?.size} bytes)`);
        });
      }
    }
  } catch (e) {
    console.log('❌ List files error:', e.message);
  }

  console.log('\n4️⃣ Testing different user folder upload...');
  try {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const testFileName = `${fakeUserId}/test_${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testFileName, pngHeader, {
        contentType: 'image/png'
      });
    
    if (error) {
      console.log('❌ User folder upload failed:', error.message);
    } else {
      console.log('✅ User folder upload succeeded:', data.path);
      await supabase.storage.from('profile-photos').remove([testFileName]);
    }
  } catch (e) {
    console.log('❌ User folder test error:', e.message);
  }

  console.log('\n📋 DIAGNOSIS:');
  console.log('=============');
  console.log('The profile-photos bucket exists and is accessible.');
  console.log('Issue is likely with:');
  console.log('1. Storage policies requiring authentication');
  console.log('2. Frontend authentication not working properly');
  console.log('3. User folder structure requirements in policies');
  console.log('\nNext step: Test with authenticated user session');
}

testImageUpload().catch(console.error);