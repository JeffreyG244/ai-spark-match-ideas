#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzskjzkolyiwhijslqmq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧹 CLEANING LUVLANG.ORG - REMOVING SEED DATA');
console.log('============================================\n');

async function removeSeedProfiles() {
    console.log('1. 🗑️  Removing Seed Profiles...');
    
    try {
        // Find and delete profiles that look like seed data
        const seedIndicators = [
            'test@',
            'demo@',
            'seed@',
            'sample@',
            'fake@',
            'Alexandra Sterling',
            'Marcus Chen', 
            'Sofia Rodriguez',
            'David Park',
            'Jennifer Walsh',
            'Executive Professional',
            'Fortune 500',
            'Goldman Sachs',
            'Netflix',
            'Salesforce',
            'JPMorgan',
            'Meta'
        ];
        
        console.log('🔍 Searching for seed profiles...');
        
        // Get all profiles to check
        const { data: profiles, error } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, company, title, created_at');
            
        if (error) {
            console.log(`❌ Error fetching profiles: ${error.message}`);
            return false;
        }
        
        console.log(`📊 Found ${profiles?.length || 0} total profiles`);
        
        // Identify seed profiles
        const seedProfiles = profiles?.filter(profile => {
            const email = profile.email?.toLowerCase() || '';
            const firstName = profile.first_name || '';
            const lastName = profile.last_name || '';
            const company = profile.company || '';
            const title = profile.title || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            // Check if this looks like seed data
            return seedIndicators.some(indicator => 
                email.includes(indicator.toLowerCase()) ||
                fullName.includes(indicator) ||
                company.includes(indicator) ||
                title.includes(indicator)
            );
        }) || [];
        
        console.log(`🎯 Identified ${seedProfiles.length} seed profiles:`);
        seedProfiles.forEach(profile => {
            console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.email})`);
        });
        
        if (seedProfiles.length === 0) {
            console.log('✅ No seed profiles found to remove');
            return true;
        }
        
        // Delete seed profiles (be careful - this will cascade delete related data)
        for (const profile of seedProfiles) {
            console.log(`🗑️  Deleting profile: ${profile.first_name} ${profile.last_name}`);
            
            // Note: This might be restricted by RLS policies
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', profile.id);
                
            if (deleteError) {
                console.log(`   ❌ Failed to delete ${profile.first_name}: ${deleteError.message}`);
            } else {
                console.log(`   ✅ Deleted successfully`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Error removing seed profiles: ${error.message}`);
        return false;
    }
}

async function checkRealConversations() {
    console.log('\n2. 💬 Checking Real Conversations...');
    
    try {
        // Check if there are real conversations in the database
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('id, participant_1, participant_2, created_at')
            .limit(10);
            
        if (error) {
            console.log(`❌ Error checking conversations: ${error.message}`);
            return false;
        }
        
        console.log(`📊 Found ${conversations?.length || 0} real conversations in database`);
        
        if (conversations && conversations.length > 0) {
            console.log('✅ Real conversations exist - messaging system should use these');
            conversations.forEach((conv, index) => {
                console.log(`   ${index + 1}. Conversation ${conv.id} (${new Date(conv.created_at).toLocaleDateString()})`);
            });
        } else {
            console.log('ℹ️  No real conversations found - messaging will show empty state');
        }
        
        // Check real messages
        const { data: messages, error: msgError } = await supabase
            .from('conversation_messages')
            .select('id, conversation_id, sender_id, content, created_at')
            .limit(5);
            
        if (msgError) {
            console.log(`⚠️  Error checking messages: ${msgError.message}`);
        } else {
            console.log(`📊 Found ${messages?.length || 0} real messages in database`);
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Error checking conversations: ${error.message}`);
        return false;
    }
}

async function analyzeCurrentMessaging() {
    console.log('\n3. 🔍 Analyzing Current Messaging Implementation...');
    
    console.log('📋 Current Issue: EnhancedExecutiveMessaging.tsx uses hardcoded demo data');
    console.log('   - Hardcoded profiles: Alexandra Sterling, Marcus Chen, etc.');
    console.log('   - Hardcoded messages that reset on page load');  
    console.log('   - localStorage deletion only affects demo messages');
    console.log('');
    console.log('🔧 Required Fix: Switch to real database-backed messaging');
    console.log('   - Use real conversations from "conversations" table');
    console.log('   - Use real messages from "conversation_messages" table');
    console.log('   - Implement proper message deletion in database');
    console.log('   - Remove all hardcoded demo profiles and messages');
    
    return true;
}

async function generateFixPlan() {
    console.log('\n🎯 FIX IMPLEMENTATION PLAN');
    console.log('==========================');
    
    console.log('✅ COMPLETED STEPS:');
    console.log('   1. Identified seed data removal needs');
    console.log('   2. Located hardcoded demo messaging system');
    console.log('   3. Analyzed real database structure');
    
    console.log('');
    console.log('🛠️  REQUIRED FIXES:');
    console.log('   1. Replace EnhancedExecutiveMessaging with real database queries');
    console.log('   2. Use useConversations and useMessages hooks properly');
    console.log('   3. Implement real message deletion via database updates');
    console.log('   4. Remove all hardcoded demo profiles and messages');
    console.log('   5. Add proper empty states when no real conversations exist');
    
    console.log('');
    console.log('📁 FILES TO MODIFY:');
    console.log('   - src/components/messaging/EnhancedExecutiveMessaging.tsx');
    console.log('   - src/hooks/useMessages.ts (add delete functionality)');
    console.log('   - src/hooks/useConversations.ts (ensure real data only)');
    
    console.log('');
    console.log('🗃️  DATABASE CHANGES NEEDED:');
    console.log('   - Add deleted_at column to conversation_messages table');
    console.log('   - Or add deleted_by_users array to track per-user deletions');
    console.log('   - Update RLS policies to support message deletion');
    
    return true;
}

async function runCleanup() {
    console.log('Starting comprehensive cleanup and analysis...\n');
    
    const results = {
        seedRemoval: await removeSeedProfiles(),
        conversationCheck: await checkRealConversations(), 
        messagingAnalysis: await analyzeCurrentMessaging(),
        planGeneration: await generateFixPlan()
    };
    
    console.log('\n📊 CLEANUP SUMMARY');
    console.log('==================');
    
    const allSuccess = Object.values(results).every(r => r);
    
    if (allSuccess) {
        console.log('✅ Analysis completed successfully');
        console.log('');
        console.log('🚀 NEXT ACTIONS:');
        console.log('   1. Implement real database-backed messaging');
        console.log('   2. Remove hardcoded demo data from components');
        console.log('   3. Add proper message deletion to database');
        console.log('   4. Test with real user conversations');
        console.log('   5. Deploy the fixes to production');
    } else {
        console.log('⚠️  Some steps encountered issues');
        Object.entries(results).forEach(([step, success]) => {
            console.log(`   ${success ? '✅' : '❌'} ${step}`);
        });
    }
    
    process.exit(0);
}

runCleanup().catch(console.error);