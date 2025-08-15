// Supabase Setup Checker
// This script helps verify Supabase storage buckets and permissions

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStorageBuckets() {
  console.log('🔍 Checking Supabase storage buckets...');
  
  try {
    // Check if buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Error listing buckets:', error.message);
      return false;
    }
    
    console.log('📁 Available buckets:', buckets.map(b => b.name));
    
    // Check for required buckets
    const requiredBuckets = ['profile-photos', 'voice-recordings'];
    const missingBuckets = requiredBuckets.filter(
      required => !buckets.find(bucket => bucket.name === required)
    );
    
    if (missingBuckets.length > 0) {
      console.log('❌ Missing buckets:', missingBuckets);
      console.log('📝 Please create these buckets in your Supabase dashboard:');
      missingBuckets.forEach(bucket => {
        console.log(`   - ${bucket} (public: true)`);
      });
      return false;
    } else {
      console.log('✅ All required buckets exist');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Failed to check buckets:', error.message);
    return false;
  }
}

async function testFileUpload() {
  console.log('🧪 Testing file upload functionality...');
  
  try {
    // Create a test file
    const testContent = 'Test file for LuvLang storage verification';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    // Try to upload to profile-photos bucket
    const testPath = `test-${Date.now()}.txt`;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(testPath, testBlob);
    
    if (error) {
      console.log('❌ Upload test failed:', error.message);
      
      if (error.message.includes('Bucket not found')) {
        console.log('💡 Bucket does not exist. Please create it in Supabase dashboard.');
      } else if (error.message.includes('permission')) {
        console.log('💡 Permission denied. Please check bucket policies.');
      }
      
      return false;
    }
    
    console.log('✅ Test upload successful:', data.path);
    
    // Clean up test file
    await supabase.storage
      .from('profile-photos')
      .remove([testPath]);
    
    console.log('🧹 Test file cleaned up');
    return true;
    
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
    return false;
  }
}

async function checkAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    // Try anonymous sign-in
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.log('❌ Anonymous auth failed:', error.message);
      return false;
    }
    
    console.log('✅ Anonymous authentication successful');
    console.log('👤 User ID:', data.user.id);
    
    return true;
    
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

async function checkEdgeFunction() {
  console.log('⚡ Testing PayPal edge function...');
  
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ No session available for edge function test');
      return false;
    }
    
    // Test edge function call
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-paypal-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planType: 'premium',
        billingCycle: 'monthly'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Edge function test successful');
      console.log('💳 Order ID:', data.orderID);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ Edge function failed:', errorData.error);
      
      if (errorData.error.includes('PayPal credentials')) {
        console.log('💡 PayPal credentials not configured in Supabase.');
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Edge function test error:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🏥 Running Supabase diagnostics for LuvLang...\n');
  
  const tests = [
    { name: 'Storage Buckets', fn: checkStorageBuckets },
    { name: 'Authentication', fn: checkAuthentication },
    { name: 'File Upload', fn: testFileUpload },
    { name: 'PayPal Edge Function', fn: checkEdgeFunction }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${test.name} failed:`, error.message);
    }
  }
  
  console.log(`\n📊 Diagnostics Results: ${passed}/${tests.length} checks passed`);
  
  if (passed === tests.length) {
    console.log('🎉 All Supabase services are functioning correctly!');
  } else {
    console.log('⚠️ Some issues found. Please address the problems above.');
  }
}

// Export for use
export { runDiagnostics, checkStorageBuckets, testFileUpload, checkAuthentication, checkEdgeFunction };

// Auto-run if this is the main module
if (typeof window !== 'undefined') {
  runDiagnostics();
}