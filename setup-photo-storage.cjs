const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

// You'll need to replace this with your service role key for bucket creation
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupPhotoStorage() {
  console.log('🚀 SETTING UP PHOTO STORAGE INFRASTRUCTURE');
  console.log('==========================================\n');
  
  const results = {
    bucketCreation: false,
    policyCreation: false,
    bucketTest: false,
    uploadTest: false,
    cleanup: false
  };
  
  try {
    // Step 1: Check current state
    console.log('1️⃣ Checking current storage state...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Failed to access storage:', listError.message);
      return;
    }
    
    const profileBucket = buckets.find(b => b.name === 'profile-photos');
    
    if (profileBucket) {
      console.log('✅ profile-photos bucket already exists');
      results.bucketCreation = true;
    } else {
      console.log('📝 profile-photos bucket missing - will attempt creation');
      
      // Step 2: Create bucket via SQL (more reliable than API)
      console.log('\n2️⃣ Creating bucket via SQL...');
      
      const bucketSQL = `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'profile-photos',
          'profile-photos', 
          true, 
          10485760,
          ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
        )
        ON CONFLICT (id) DO UPDATE SET
          public = EXCLUDED.public,
          file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
      `;
      
      try {
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: bucketSQL });
        if (sqlError) {
          console.log('❌ SQL bucket creation failed:', sqlError.message);
          // Try direct API approach
          console.log('🔄 Trying direct API approach...');
          
          const { data: bucketData, error: bucketError } = await supabase.storage
            .createBucket('profile-photos', {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024,
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            });
          
          if (bucketError) {
            console.log('❌ Direct API bucket creation failed:', bucketError.message);
            console.log('⚠️  You may need to create the bucket manually in Supabase Dashboard');
          } else {
            console.log('✅ Bucket created via API');
            results.bucketCreation = true;
          }
        } else {
          console.log('✅ Bucket created via SQL');
          results.bucketCreation = true;
        }
      } catch (err) {
        console.log('❌ Bucket creation error:', err.message);
      }
    }
    
    // Step 3: Create RLS Policies
    console.log('\n3️⃣ Setting up RLS policies...');
    
    const policies = [
      {
        name: 'Users can upload their own profile photos',
        sql: `
          DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
          CREATE POLICY "Users can upload their own profile photos" ON storage.objects
          FOR INSERT 
          TO authenticated 
          WITH CHECK (
            bucket_id = 'profile-photos' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      },
      {
        name: 'Users can view all profile photos',
        sql: `
          DROP POLICY IF EXISTS "Users can view all profile photos" ON storage.objects;
          CREATE POLICY "Users can view all profile photos" ON storage.objects
          FOR SELECT 
          TO authenticated 
          USING (bucket_id = 'profile-photos');
        `
      },
      {
        name: 'Users can delete their own photos',
        sql: `
          DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
          CREATE POLICY "Users can delete their own profile photos" ON storage.objects
          FOR DELETE 
          TO authenticated 
          USING (
            bucket_id = 'profile-photos' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      }
    ];
    
    let policySuccessCount = 0;
    
    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (policyError) {
          console.log(`❌ Failed to create policy "${policy.name}":`, policyError.message);
        } else {
          console.log(`✅ Created policy: "${policy.name}"`);
          policySuccessCount++;
        }
      } catch (err) {
        console.log(`❌ Policy creation error for "${policy.name}":`, err.message);
      }
    }
    
    results.policyCreation = policySuccessCount === policies.length;
    
    if (policySuccessCount === 0) {
      console.log('⚠️  RLS policies failed - you may need to run the SQL manually');
      console.log('   Check the setup-storage.sql file for the required SQL commands');
    }
    
    // Step 4: Test bucket accessibility
    console.log('\n4️⃣ Testing bucket accessibility...');
    
    try {
      const { data: testList, error: testError } = await supabase.storage
        .from('profile-photos')
        .list('', { limit: 1 });
      
      if (testError) {
        console.log('❌ Bucket test failed:', testError.message);
        results.bucketTest = false;
      } else {
        console.log('✅ Bucket is accessible');
        results.bucketTest = true;
      }
    } catch (err) {
      console.log('❌ Bucket test error:', err.message);
      results.bucketTest = false;
    }
    
    // Step 5: Test upload functionality
    console.log('\n5️⃣ Testing upload functionality...');
    
    if (results.bucketTest) {
      try {
        // Create minimal test file
        const testContent = Buffer.from('test image data');
        const filename = `test/setup-test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filename, testContent, {
            contentType: 'text/plain',
            upsert: false
          });
        
        if (uploadError) {
          console.log('❌ Upload test failed:', uploadError.message);
          results.uploadTest = false;
        } else {
          console.log('✅ Upload test successful');
          console.log('   Test file path:', uploadData.path);
          results.uploadTest = true;
          
          // Clean up test file
          const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([filename]);
          
          if (!deleteError) {
            console.log('✅ Test cleanup successful');
            results.cleanup = true;
          }
        }
      } catch (err) {
        console.log('❌ Upload test error:', err.message);
        results.uploadTest = false;
      }
    } else {
      console.log('⏭️  Skipping upload test (bucket not accessible)');
    }
    
  } catch (error) {
    console.log('❌ Setup error:', error.message);
  }
  
  // Final Results
  console.log('\n📊 SETUP RESULTS');
  console.log('================');
  console.log(`Bucket Creation:     ${results.bucketCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Policy Creation:     ${results.policyCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Bucket Test:         ${results.bucketTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Upload Test:         ${results.uploadTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cleanup:             ${results.cleanup ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const percentage = Math.round((passCount / totalTests) * 100);
  
  console.log(`\\nSetup Score: ${passCount}/${totalTests} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('\\n🎉 PHOTO STORAGE IS FULLY CONFIGURED!');
    console.log('    Your photo upload feature should now work perfectly.');
  } else {
    console.log('\\n⚠️  MANUAL STEPS MAY BE REQUIRED');
    console.log('   Please check the recommendations below:');
    
    if (!results.bucketCreation) {
      console.log('   → Create profile-photos bucket in Supabase Dashboard');
    }
    if (!results.policyCreation) {
      console.log('   → Run the SQL from setup-storage.sql in Supabase SQL Editor');
    }
    if (!results.bucketTest) {
      console.log('   → Check storage permissions and RLS policies');
    }
  }
  
  return {
    success: percentage === 100,
    percentage,
    results
  };
}

// Run setup
if (require.main === module) {
  setupPhotoStorage()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupPhotoStorage };