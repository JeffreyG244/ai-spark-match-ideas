#!/usr/bin/env node

/**
 * Production Webhook Test Script
 * Tests the Railway N8N webhook integration
 */

const RAILWAY_URL = 'https://heroic-victory.up.railway.app';
const WEBHOOK_ENDPOINT = `${RAILWAY_URL}/webhook`;

async function testProductionWebhook() {
  console.log('🚀 Testing Production Webhook Integration...\n');
  
  // Test 1: Basic webhook connectivity
  console.log('1️⃣ Testing webhook endpoint connectivity...');
  try {
    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LuvLang-Production-Test'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Railway URL: ${RAILWAY_URL}`);
    
    if (response.ok) {
      console.log('   ✅ Webhook endpoint is accessible');
    } else {
      console.log('   ⚠️ Webhook endpoint returned:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Webhook endpoint not accessible:', error.message);
  }
  
  // Test 2: Profile processing webhook
  console.log('\n2️⃣ Testing profile processing webhook...');
  try {
    const testPayload = {
      event_type: 'profile_created',
      user_id: 'test-user-123',
      profile_data: {
        name: 'Test Executive',
        title: 'CEO',
        company: 'Test Corp',
        industry: 'Technology'
      },
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LuvLang-Production-Test'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('   ✅ Profile webhook processed successfully');
      console.log('   Response:', result);
    } else {
      console.log('   ⚠️ Profile webhook returned:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Profile webhook failed:', error.message);
  }
  
  // Test 3: Health check
  console.log('\n3️⃣ Testing Railway service health...');
  try {
    const response = await fetch(`${RAILWAY_URL}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'LuvLang-Production-Test'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Railway service is healthy');
    } else {
      console.log(`   ⚠️ Health check returned: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
  }
  
  console.log('\n🎯 Production Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Verify environment variables are set in Railway dashboard');
  console.log('2. Check Railway deployment logs for any errors');
  console.log('3. Test the full user flow from luvlang.org');
}

// Run the test
testProductionWebhook().catch(console.error);