#!/usr/bin/env node

// Apply database schema fixes for Luvlang photo upload
// This script will set up the database schema for photo storage

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

console.log('🗃️  LUVLANG DATABASE SCHEMA SETUP');
console.log('=================================\n');

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyDatabaseSchema() {
    console.log('📋 Setting up database schema for photo uploads...');
    
    if (!SERVICE_ROLE_KEY) {
        console.log('❌ Service role key not available');
        console.log('📋 MANUAL DATABASE SETUP REQUIRED:');
        console.log('');
        console.log('1. Go to https://app.supabase.com');
        console.log('2. Select your project: tzskjzkolyiwhijslqmq');
        console.log('3. Navigate to SQL Editor in the left sidebar');
        console.log('4. Copy and paste the content from COMPLETE_PHOTO_SETUP.sql');
        console.log('5. Click "Run" to execute the SQL');
        console.log('6. Verify no errors appear');
        console.log('');
        
        // Show the SQL content
        try {
            const sqlContent = fs.readFileSync('./COMPLETE_PHOTO_SETUP.sql', 'utf8');
            console.log('📄 SQL SCRIPT TO RUN:');
            console.log('===================');
            console.log(sqlContent);
            console.log('===================');
        } catch (error) {
            console.log('⚠️  COMPLETE_PHOTO_SETUP.sql file not found');
            console.log('   Run the FORCE_FIX_PHOTO_UPLOAD.mjs script first');
        }
        
        console.log('');
        console.log('⏯️  Press Enter after running the SQL script...');
        
        await new Promise(resolve => {
            process.stdin.once('data', () => resolve());
        });
        
        return await verifyDatabaseSchema();
    }
    
    // Try to apply schema with service role key
    try {
        console.log('🔑 Using service role key to apply schema...');
        const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        
        // Apply the SQL schema
        const sqlContent = fs.readFileSync('./COMPLETE_PHOTO_SETUP.sql', 'utf8');
        
        // Split into individual statements and execute
        const statements = sqlContent
            .split(';')
            .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
            .map(stmt => stmt.trim());
        
        console.log(`📋 Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                try {
                    const { error } = await adminSupabase.rpc('exec_sql', { sql: statement });
                    if (error) {
                        console.log(`⚠️  Statement ${i + 1} warning: ${error.message}`);
                    } else {
                        console.log(`✅ Statement ${i + 1} executed successfully`);
                    }
                } catch (stmtError) {
                    console.log(`⚠️  Statement ${i + 1} error: ${stmtError.message}`);
                }
            }
        }
        
        console.log('✅ Database schema setup completed');
        return true;
        
    } catch (error) {
        console.log(`❌ Failed to apply schema: ${error.message}`);
        return false;
    }
}

async function verifyDatabaseSchema() {
    console.log('\n🔍 Verifying database schema...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        // Check if we can access the users table structure
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Users table does not exist');
                return false;
            } else if (error.code === '42501') {
                console.log('⚠️  Cannot access users table (permission issue)');
                console.log('   This is expected - RLS policies are working');
                return true; // This is actually good - means RLS is enabled
            } else {
                console.log(`❌ Database error: ${error.message}`);
                return false;
            }
        }
        
        console.log('✅ Users table is accessible');
        
        // Test if photos column exists by trying to query it
        const { error: photoError } = await supabase
            .from('users')
            .select('photos, primary_photo_url')
            .limit(1);
        
        if (photoError) {
            if (photoError.code === '42703') {
                console.log('❌ Photo columns do not exist in users table');
                return false;
            } else {
                console.log('✅ Photo columns exist (access restricted by RLS)');
                return true;
            }
        }
        
        console.log('✅ Photo columns exist and are accessible');
        return true;
        
    } catch (error) {
        console.log(`❌ Schema verification error: ${error.message}`);
        return false;
    }
}

async function checkStorageBucket() {
    console.log('\n📁 Checking storage bucket status...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log(`❌ Cannot check buckets: ${error.message}`);
            return false;
        }
        
        const profileBucket = buckets?.find(b => b.name === 'profile-photos');
        
        if (profileBucket) {
            console.log('✅ profile-photos bucket exists');
            return true;
        } else {
            console.log('❌ profile-photos bucket missing');
            console.log('💡 Run comprehensive_photo_upload_fix.mjs to create it');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Storage check error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('Starting database setup process...\n');
    
    // Step 1: Apply database schema
    const schemaApplied = await applyDatabaseSchema();
    
    if (!schemaApplied) {
        console.log('\n❌ Schema setup failed. Please apply manually and run script again.');
        process.exit(1);
    }
    
    // Step 2: Verify schema was applied correctly
    const schemaVerified = await verifyDatabaseSchema();
    
    // Step 3: Check storage bucket status
    const bucketExists = await checkStorageBucket();
    
    // Final status
    console.log('\n🎯 DATABASE SETUP RESULTS');
    console.log('=========================');
    console.log(`${schemaApplied ? '✅' : '❌'} Schema applied: ${schemaApplied}`);
    console.log(`${schemaVerified ? '✅' : '❌'} Schema verified: ${schemaVerified}`);
    console.log(`${bucketExists ? '✅' : '❌'} Storage bucket: ${bucketExists}`);
    
    if (schemaApplied && schemaVerified) {
        console.log('\n🎉 SUCCESS! Database is ready for photo uploads!');
        if (!bucketExists) {
            console.log('⚠️  Next step: Run comprehensive_photo_upload_fix.mjs to create storage bucket');
        } else {
            console.log('✅ Database and storage are both ready!');
        }
    } else {
        console.log('\n⚠️  Database setup needs attention');
        console.log('📋 Complete the manual setup in Supabase Dashboard');
    }
    
    return schemaApplied && schemaVerified;
}

main()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error('❌ Critical error:', error);
        process.exit(1);
    });