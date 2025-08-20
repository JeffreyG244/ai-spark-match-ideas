const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, anonKey);

async function checkCurrentState() {
  console.log('🔍 ANALYZING CURRENT SUPABASE STATE');
  console.log('====================================\n');
  
  const analysis = {
    buckets: [],
    bucketsExist: false,
    storageAccessible: false,
    profilePhotosExists: false,
    canTestUpload: false,
    errors: []
  };
  
  try {
    // 1. Check storage buckets
    console.log('1️⃣ Checking existing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Failed to list buckets:', bucketsError.message);
      analysis.errors.push(`Bucket listing: ${bucketsError.message}`);
    } else {
      console.log('✅ Successfully accessed storage');
      analysis.storageAccessible = true;
      analysis.buckets = buckets;
      
      if (buckets && buckets.length > 0) {
        console.log(`📦 Found ${buckets.length} bucket(s):`);
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`);
        });
        analysis.bucketsExist = true;
      } else {
        console.log('📦 No buckets found');
      }
      
      // Check specifically for profile-photos bucket
      const profileBucket = buckets?.find(b => b.name === 'profile-photos');
      if (profileBucket) {
        console.log('✅ profile-photos bucket EXISTS');
        analysis.profilePhotosExists = true;
      } else {
        console.log('❌ profile-photos bucket MISSING');
      }
    }
    
    // 2. Test profile-photos bucket access if it exists
    if (analysis.profilePhotosExists) {
      console.log('\n2️⃣ Testing profile-photos bucket access...');
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('profile-photos')
          .list('', { limit: 1 });
        
        if (listError) {
          console.log('❌ Cannot access profile-photos bucket:', listError.message);
          analysis.errors.push(`Bucket access: ${listError.message}`);
        } else {
          console.log('✅ Can access profile-photos bucket');
          console.log(`   Current files in root: ${files.length}`);
          analysis.canTestUpload = true;
        }
      } catch (err) {
        console.log('❌ Bucket access test failed:', err.message);
        analysis.errors.push(`Bucket test: ${err.message}`);
      }
    }
    
    // 3. Check if we can query policies (this will likely fail with anon key)
    console.log('\n3️⃣ Attempting to check existing policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage');
      
      if (policiesError) {
        console.log('⚠️  Cannot query policies with anon key (expected):', policiesError.message);
        console.log('   This is normal - policies need to be checked in Supabase dashboard');
      } else {
        console.log('✅ Found policies:');
        policies?.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.permissive}`);
        });
      }
    } catch (err) {
      console.log('⚠️  Policy check failed (expected with anon key)');
    }
    
    // 4. Attempt a minimal upload test if bucket exists
    if (analysis.canTestUpload) {
      console.log('\n4️⃣ Testing upload capability...');
      try {
        const testContent = new Uint8Array([1, 2, 3, 4]); // Minimal binary content
        const testFilename = `test/capability-test-${Date.now()}.bin`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(testFilename, testContent, {
            contentType: 'application/octet-stream',
            upsert: false
          });
        
        if (uploadError) {
          console.log('❌ Upload test failed:', uploadError.message);
          analysis.errors.push(`Upload test: ${uploadError.message}`);
          
          // Provide specific guidance based on error
          if (uploadError.message.includes('policy')) {
            console.log('   → This suggests RLS policies are missing or incorrect');
          } else if (uploadError.message.includes('bucket')) {
            console.log('   → This suggests bucket configuration issues');
          } else if (uploadError.message.includes('auth')) {
            console.log('   → This suggests authentication issues');
          }
        } else {
          console.log('✅ Upload test successful!');
          console.log(`   Test file uploaded to: ${uploadData.path}`);
          
          // Clean up test file
          const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([testFilename]);
          
          if (!deleteError) {
            console.log('✅ Test cleanup successful');
          }
        }
      } catch (err) {
        console.log('❌ Upload test error:', err.message);
        analysis.errors.push(`Upload error: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Analysis failed:', error.message);
    analysis.errors.push(`General error: ${error.message}`);
  }
  
  // Summary and recommendations
  console.log('\n📊 CURRENT STATE SUMMARY');
  console.log('========================');
  console.log(`Storage Accessible:      ${analysis.storageAccessible ? '✅ YES' : '❌ NO'}`);
  console.log(`Buckets Exist:           ${analysis.bucketsExist ? '✅ YES' : '❌ NO'} (${analysis.buckets.length} total)`);
  console.log(`Profile Photos Bucket:   ${analysis.profilePhotosExists ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`Can Test Upload:         ${analysis.canTestUpload ? '✅ YES' : '❌ NO'}`);
  console.log(`Errors Found:            ${analysis.errors.length} issue(s)`);
  
  if (analysis.errors.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    analysis.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  // Specific recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (!analysis.profilePhotosExists) {
    console.log('🔧 MISSING: profile-photos bucket needs to be created');
    console.log('   → Go to Supabase Dashboard → Storage → New Bucket');
    console.log('   → Name: profile-photos');
    console.log('   → Public: true');
    console.log('   → File size limit: 10MB');
  }
  
  if (analysis.errors.some(e => e.includes('policy'))) {
    console.log('🔧 MISSING: RLS policies need to be created (avoiding duplicates)');
    console.log('   → Check existing policies first to avoid "already exists" error');
  }
  
  if (analysis.profilePhotosExists && analysis.canTestUpload) {
    console.log('🎉 GOOD NEWS: Storage setup appears complete!');
    console.log('   → Your photo upload should work');
    console.log('   → Test by visiting the settings page');
  }
  
  return analysis;
}

// Run the analysis
checkCurrentState()
  .then(result => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });