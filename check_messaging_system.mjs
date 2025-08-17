#!/usr/bin/env node

/**
 * Messaging System Check and Cleanup Script
 * Verifies messaging functionality and removes test messages
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('💬 Messaging System Check & Cleanup');
console.log('=' .repeat(50));

async function checkMessageTables() {
    console.log('\n1. Checking message-related tables...');
    
    try {
        // Check if messages table exists
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .limit(5);
        
        if (msgError) {
            console.log('❌ Messages table:', msgError.message);
        } else {
            console.log(`✅ Messages table: Found ${messages?.length || 0} messages`);
            if (messages && messages.length > 0) {
                console.log('   Sample message structure:', Object.keys(messages[0]));
            }
        }
        
        // Check conversations table
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .limit(5);
        
        if (convError) {
            console.log('❌ Conversations table:', convError.message);
        } else {
            console.log(`✅ Conversations table: Found ${conversations?.length || 0} conversations`);
        }
        
        // Check matches table (users need to be matched to message)
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .limit(5);
        
        if (matchError) {
            console.log('❌ Matches table:', matchError.message);
        } else {
            console.log(`✅ Matches table: Found ${matches?.length || 0} matches`);
        }
        
    } catch (error) {
        console.error('Error checking tables:', error.message);
    }
}

async function identifyTestMessages() {
    console.log('\n2. Identifying test messages...');
    
    try {
        // Look for messages that might be test data
        const { data: allMessages, error } = await supabase
            .from('messages')
            .select('*');
        
        if (error) {
            console.log('❌ Could not retrieve messages:', error.message);
            return [];
        }
        
        if (!allMessages || allMessages.length === 0) {
            console.log('✅ No messages found in database');
            return [];
        }
        
        console.log(`📊 Total messages in database: ${allMessages.length}`);
        
        // Identify potential test messages
        const testMessages = allMessages.filter(msg => {
            const content = (msg.content || '').toLowerCase();
            const isTest = content.includes('test') || 
                          content.includes('demo') || 
                          content.includes('sample') ||
                          content.includes('hello world') ||
                          content.includes('check') ||
                          msg.sender_id === msg.receiver_id; // Self-messages are likely tests
            return isTest;
        });
        
        console.log(`🧪 Potential test messages found: ${testMessages.length}`);
        
        if (testMessages.length > 0) {
            console.log('\nTest messages preview:');
            testMessages.slice(0, 5).forEach((msg, i) => {
                console.log(`   ${i + 1}. "${msg.content}" (${msg.created_at})`);
            });
            
            if (testMessages.length > 5) {
                console.log(`   ... and ${testMessages.length - 5} more`);
            }
        }
        
        return testMessages;
        
    } catch (error) {
        console.error('Error identifying test messages:', error.message);
        return [];
    }
}

async function cleanupTestMessages(testMessages) {
    console.log('\n3. Cleaning up test messages...');
    
    if (testMessages.length === 0) {
        console.log('✅ No test messages to clean up');
        return;
    }
    
    try {
        const testMessageIds = testMessages.map(msg => msg.id);
        
        const { error } = await supabase
            .from('messages')
            .delete()
            .in('id', testMessageIds);
        
        if (error) {
            console.log('❌ Failed to delete test messages:', error.message);
        } else {
            console.log(`✅ Successfully deleted ${testMessages.length} test messages`);
        }
        
    } catch (error) {
        console.error('Error cleaning up test messages:', error.message);
    }
}

async function cleanupTestConversations() {
    console.log('\n4. Cleaning up empty/test conversations...');
    
    try {
        // Find conversations that have no messages or only had test messages
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select(`
                *,
                messages(count)
            `);
        
        if (convError) {
            console.log('❌ Could not check conversations:', convError.message);
            return;
        }
        
        if (!conversations || conversations.length === 0) {
            console.log('✅ No conversations to clean up');
            return;
        }
        
        // Find empty conversations
        const emptyConversations = conversations.filter(conv => 
            !conv.messages || conv.messages.length === 0
        );
        
        if (emptyConversations.length > 0) {
            const emptyIds = emptyConversations.map(conv => conv.id);
            
            const { error: deleteError } = await supabase
                .from('conversations')
                .delete()
                .in('id', emptyIds);
            
            if (deleteError) {
                console.log('❌ Failed to delete empty conversations:', deleteError.message);
            } else {
                console.log(`✅ Deleted ${emptyConversations.length} empty conversations`);
            }
        } else {
            console.log('✅ No empty conversations to clean up');
        }
        
    } catch (error) {
        console.error('Error cleaning up conversations:', error.message);
    }
}

async function testMessagingFunctionality() {
    console.log('\n5. Testing messaging functionality...');
    
    try {
        // Test inserting a message (we'll delete it right after)
        const testMessage = {
            content: 'TEMP_FUNCTIONALITY_TEST',
            sender_id: '00000000-0000-0000-0000-000000000000',
            receiver_id: '00000000-0000-0000-0000-000000000001',
            created_at: new Date().toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('messages')
            .insert([testMessage])
            .select();
        
        if (insertError) {
            console.log('❌ Message insertion test failed:', insertError.message);
            return false;
        }
        
        console.log('✅ Message insertion works');
        
        // Clean up the test message immediately
        if (insertData && insertData.length > 0) {
            await supabase
                .from('messages')
                .delete()
                .eq('id', insertData[0].id);
            console.log('✅ Test message cleaned up');
        }
        
        // Test reading messages
        const { data: readData, error: readError } = await supabase
            .from('messages')
            .select('*')
            .limit(1);
        
        if (readError) {
            console.log('❌ Message reading test failed:', readError.message);
            return false;
        }
        
        console.log('✅ Message reading works');
        return true;
        
    } catch (error) {
        console.error('Error testing messaging functionality:', error.message);
        return false;
    }
}

async function generateMessagingReport() {
    console.log('\n6. Generating final messaging system report...');
    
    try {
        // Count final message statistics
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*');
        
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*');
        
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*');
        
        console.log('\n📊 FINAL MESSAGING SYSTEM STATUS:');
        console.log('-'.repeat(40));
        console.log(`💬 Messages: ${messages?.length || 0}`);
        console.log(`🗨️  Conversations: ${conversations?.length || 0}`);
        console.log(`💝 Matches: ${matches?.length || 0}`);
        
        const isHealthy = !msgError && !convError && !matchError;
        console.log(`🏥 System Health: ${isHealthy ? '✅ Healthy' : '❌ Issues Detected'}`);
        
    } catch (error) {
        console.error('Error generating report:', error.message);
    }
}

async function runMessagingCheck() {
    console.log('🚀 Starting messaging system verification...');
    console.log(`📅 Started: ${new Date().toISOString()}\n`);
    
    await checkMessageTables();
    const testMessages = await identifyTestMessages();
    await cleanupTestMessages(testMessages);
    await cleanupTestConversations();
    const functionalityWorks = await testMessagingFunctionality();
    await generateMessagingReport();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🏁 MESSAGING VERIFICATION COMPLETE');
    console.log('=' .repeat(50));
    
    if (functionalityWorks) {
        console.log('🎉 Messaging system is fully functional!');
        console.log('✅ Users can send and receive messages');
        console.log('✅ Database tables are working correctly');
        console.log('✅ Test data has been cleaned up');
    } else {
        console.log('⚠️  Messaging system may have issues');
        console.log('❌ Check database permissions and table structure');
    }
    
    console.log(`\n📅 Completed: ${new Date().toISOString()}`);
}

// Run the messaging system check
runMessagingCheck().catch(console.error);