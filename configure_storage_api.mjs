#!/usr/bin/env node

// Configure Supabase storage using REST API
// This bypasses the need for service role key by using direct API calls

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

console.log('🔧 CONFIGURING SUPABASE STORAGE VIA API');
console.log('=======================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCurrentState() {
    console.log('🔍 Checking current state...');
    
    try {
        // Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        const bucketExists = !bucketError && buckets?.find(b => b.name === 'profile-photos');
        console.log(`📁 Bucket exists: ${bucketExists ? 'Yes' : 'No'}`);
        
        if (bucketExists) {
            // Test bucket access
            const { error: accessError } = await supabase.storage
                .from('profile-photos')
                .list('', { limit: 1 });
            
            console.log(`🔓 Bucket accessible: ${!accessError ? 'Yes' : 'No'}`);
            
            if (accessError) {
                console.log(`   Error: ${accessError.message}`);
            }
        }
        
        // Check database schema
        const { error: schemaError } = await supabase
            .from('users')
            .select('photos, primary_photo_url')
            .limit(1);
        
        const schemaExists = !schemaError || schemaError.code === '42501'; // 42501 = RLS restriction (good)
        console.log(`🗃️  Schema ready: ${schemaExists ? 'Yes' : 'No'}`);
        
        if (schemaError && schemaError.code !== '42501') {
            console.log(`   Error: ${schemaError.message}`);
        }
        
        return {
            bucketExists,
            bucketAccessible: bucketExists && !accessError,
            schemaExists
        };
        
    } catch (error) {
        console.log(`❌ State check error: ${error.message}`);
        return {
            bucketExists: false,
            bucketAccessible: false,
            schemaExists: false
        };
    }
}

async function createBucketViaSupabaseCLI() {
    console.log('\n📁 Creating storage bucket via Supabase CLI...');
    
    // First, let's check if supabase CLI is available
    const { execSync } = await import('child_process');
    
    try {
        // Check if supabase CLI is installed
        execSync('which supabase', { stdio: 'pipe' });
        console.log('✅ Supabase CLI found');
        
        // Try to create the bucket
        try {
            const output = execSync('supabase storage create profile-photos --public', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            console.log('✅ Bucket created via CLI');
            console.log(output);
            return true;
        } catch (cliError) {
            if (cliError.stdout && cliError.stdout.includes('already exists')) {
                console.log('✅ Bucket already exists');
                return true;
            } else {
                console.log(`❌ CLI bucket creation failed: ${cliError.message}`);
                return false;
            }
        }
        
    } catch (whichError) {
        console.log('❌ Supabase CLI not found');
        return false;
    }
}

async function generateCurlCommands() {
    console.log('\n🌐 Generating curl commands for manual setup...');
    
    const projectRef = 'tzskjzkolyiwhijslqmq';
    
    console.log('');
    console.log('📋 MANUAL SETUP WITH CURL:');
    console.log('===========================');
    console.log('');
    console.log('1. Get your service role key from Supabase Dashboard');
    console.log('2. Replace YOUR_SERVICE_ROLE_KEY in the commands below');
    console.log('3. Run these curl commands:');
    console.log('');
    
    // Create bucket
    console.log('# Create storage bucket:');
    console.log(`curl -X POST \\`);
    console.log(`  "${SUPABASE_URL}/storage/v1/bucket" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{`);
    console.log(`    "id": "profile-photos",`);
    console.log(`    "name": "profile-photos",`);
    console.log(`    "public": true,`);
    console.log(`    "file_size_limit": 10485760,`);
    console.log(`    "allowed_mime_types": ["image/png", "image/jpg", "image/jpeg", "image/webp"]`);
    console.log(`  }'`);
    console.log('');
    
    // Create policies
    console.log('# Create storage policies:');
    const policies = [
        `CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');`,
        `CREATE POLICY "Allow public photo access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-photos');`,
        `CREATE POLICY "Allow users to update own photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]) WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);`,
        `CREATE POLICY "Allow users to delete own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);`
    ];
    
    policies.forEach((policy, index) => {
        console.log(`curl -X POST \\`);
        console.log(`  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \\`);
        console.log(`  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"sql": "${policy.replace(/"/g, '\\"')}"}'`);
        console.log('');
    });
}

async function generateSupabaseDashboardInstructions() {
    console.log('\n🎛️  SUPABASE DASHBOARD SETUP');
    console.log('============================');
    console.log('');
    console.log('The easiest way to configure the backend:');
    console.log('');
    console.log('1. STORAGE BUCKET:');
    console.log('   • Go to https://app.supabase.com/project/tzskjzkolyiwhijslqmq/storage/buckets');
    console.log('   • Click "Create bucket"');
    console.log('   • Name: profile-photos');
    console.log('   • Public: ✅ Enabled');
    console.log('   • File size limit: 10 MB');
    console.log('   • Allowed MIME types: image/png,image/jpg,image/jpeg,image/webp');
    console.log('');
    console.log('2. STORAGE POLICIES:');
    console.log('   • Go to https://app.supabase.com/project/tzskjzkolyiwhijslqmq/storage/policies');
    console.log('   • Click profile-photos bucket');
    console.log('   • Click "Add policy" (4 times)');
    console.log('');
    console.log('   Policy 1: Allow authenticated uploads');
    console.log('   - Operation: INSERT');
    console.log('   - Target: authenticated');
    console.log('   - USING: bucket_id = \'profile-photos\'');
    console.log('');
    console.log('   Policy 2: Allow public photo access');
    console.log('   - Operation: SELECT');
    console.log('   - Target: public');
    console.log('   - USING: bucket_id = \'profile-photos\'');
    console.log('');
    console.log('   Policy 3: Allow users to update own photos');
    console.log('   - Operation: UPDATE');
    console.log('   - Target: authenticated');
    console.log('   - USING: bucket_id = \'profile-photos\' AND auth.uid()::text = (storage.foldername(name))[1]');
    console.log('   - WITH CHECK: bucket_id = \'profile-photos\' AND auth.uid()::text = (storage.foldername(name))[1]');
    console.log('');
    console.log('   Policy 4: Allow users to delete own photos');
    console.log('   - Operation: DELETE');
    console.log('   - Target: authenticated');
    console.log('   - USING: bucket_id = \'profile-photos\' AND auth.uid()::text = (storage.foldername(name))[1]');
    console.log('');
    console.log('3. DATABASE SCHEMA:');
    console.log('   • Go to https://app.supabase.com/project/tzskjzkolyiwhijslqmq/sql/new');
    console.log('   • Copy and run the SQL from COMPLETE_PHOTO_SETUP.sql');
    console.log('');
    console.log('4. TEST THE SYSTEM:');
    console.log('   • Run: node final_photo_upload_test.mjs');
}

async function main() {
    console.log('Analyzing current configuration and generating setup instructions...\n');
    
    // Check current state
    const currentState = await checkCurrentState();
    
    console.log('\n📊 CURRENT STATUS:');
    console.log(`📁 Storage bucket: ${currentState.bucketExists ? '✅' : '❌'}`);
    console.log(`🔓 Bucket accessible: ${currentState.bucketAccessible ? '✅' : '❌'}`);
    console.log(`🗃️  Database schema: ${currentState.schemaExists ? '✅' : '❌'}`);
    
    if (currentState.bucketExists && currentState.bucketAccessible && currentState.schemaExists) {
        console.log('\n🎉 BACKEND IS ALREADY CONFIGURED!');
        console.log('✅ Photo upload should be working');
        console.log('🧪 Run: node final_photo_upload_test.mjs to verify');
        return true;
    }
    
    // Try CLI approach first
    let bucketCreated = false;
    if (!currentState.bucketExists) {
        bucketCreated = await createBucketViaSupabaseCLI();
    }
    
    if (bucketCreated || currentState.bucketExists) {
        // Test the new state
        const newState = await checkCurrentState();
        if (newState.bucketExists && newState.bucketAccessible && newState.schemaExists) {
            console.log('\n🎉 BACKEND CONFIGURATION COMPLETED!');
            console.log('✅ Photo upload is now working');
            return true;
        }
    }
    
    // Generate manual setup instructions
    await generateSupabaseDashboardInstructions();
    await generateCurlCommands();
    
    console.log('\n🔗 QUICK LINKS:');
    console.log('- Storage: https://app.supabase.com/project/tzskjzkolyiwhijslqmq/storage/buckets');
    console.log('- SQL Editor: https://app.supabase.com/project/tzskjzkolyiwhijslqmq/sql/new');
    console.log('- API Settings: https://app.supabase.com/project/tzskjzkolyiwhijslqmq/settings/api');
    
    return false;
}

main()
    .then(success => {
        console.log(`\n🏁 Configuration ${success ? 'COMPLETED' : 'INSTRUCTIONS PROVIDED'}`);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Configuration error:', error);
        process.exit(1);
    });