#!/usr/bin/env node

/**
 * Delete Test Messages
 * Removes all test/unwanted messages from the messages table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🗑️  Deleting Test Messages');
console.log('=' .repeat(40));

async function findAndDeleteTestMessages() {
    console.log('1. Finding test messages...');
    
    try {
        // Get all messages to identify test ones
        const { data: allMessages, error: fetchError } = await supabase
            .from('messages')
            .select('*');
        
        if (fetchError) {
            console.log('❌ Error fetching messages:', fetchError.message);
            return false;
        }
        
        if (!allMessages || allMessages.length === 0) {
            console.log('✅ No messages found in database');
            return true;
        }
        
        console.log(`📊 Total messages found: ${allMessages.length}`);
        
        // Show all messages for review
        console.log('\n📋 Current messages:');
        allMessages.forEach((msg, i) => {
            const preview = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
            console.log(`   ${i + 1}. "${preview}" (${msg.created_at})`);
        });
        
        // Delete ALL messages (since you want to clean the tab)
        console.log('\n2. Deleting all messages...');
        
        const messageIds = allMessages.map(msg => msg.id);
        
        const { error: deleteError } = await supabase
            .from('messages')
            .delete()
            .in('id', messageIds);
        
        if (deleteError) {
            console.log('❌ Error deleting messages:', deleteError.message);
            return false;
        }
        
        console.log(`✅ Successfully deleted ${allMessages.length} messages`);
        
        // Also clean up empty conversations
        console.log('\n3. Cleaning up empty conversations...');
        
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*');
        
        if (convError) {
            console.log('⚠️  Could not check conversations:', convError.message);
        } else if (conversations && conversations.length > 0) {
            // Delete all conversations since all messages are gone
            const convIds = conversations.map(conv => conv.id);
            
            const { error: deleteConvError } = await supabase
                .from('conversations')
                .delete()
                .in('id', convIds);
            
            if (deleteConvError) {
                console.log('⚠️  Error deleting conversations:', deleteConvError.message);
            } else {
                console.log(`✅ Deleted ${conversations.length} empty conversations`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return false;
    }
}

async function verifyCleanup() {
    console.log('\n4. Verifying cleanup...');
    
    try {
        const { data: remainingMessages, error } = await supabase
            .from('messages')
            .select('*');
        
        if (error) {
            console.log('⚠️  Error checking remaining messages:', error.message);
        } else {
            const count = remainingMessages?.length || 0;
            if (count === 0) {
                console.log('✅ Messages tab is now clean - no messages remain');
            } else {
                console.log(`⚠️  ${count} messages still remain`);
            }
        }
        
    } catch (error) {
        console.error('Error verifying cleanup:', error.message);
    }
}

async function runCleanup() {
    console.log('🚀 Starting message cleanup...');
    console.log(`📅 Started: ${new Date().toISOString()}\n`);
    
    const success = await findAndDeleteTestMessages();
    await verifyCleanup();
    
    console.log('\n' + '=' .repeat(40));
    if (success) {
        console.log('🎉 Message cleanup complete!');
        console.log('✅ Messages tab should now be empty');
        console.log('✅ Ready for real user messages');
    } else {
        console.log('❌ Cleanup encountered issues');
        console.log('⚠️  Check error messages above');
    }
    
    console.log(`\n📅 Completed: ${new Date().toISOString()}`);
}

// Run the cleanup
runCleanup().catch(console.error);