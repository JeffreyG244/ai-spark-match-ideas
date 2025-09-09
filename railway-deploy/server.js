/**
 * LuvLang Production Backend Server
 * Handles N8N webhooks and integrates with Supabase
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.Ti_qWd6OWQKTgjy2ZAc5TQPrWKEDI-_DjLVqsGo3Vqs';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'LuvLang Backend',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/health',
      '/webhook',
      '/webhook/profile',
      '/webhook/matching'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      port: port
    }
  });
});

// Main webhook endpoint for N8N
app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    
    const { event_type, user_id, profile_data } = req.body;
    
    // Log webhook event to Supabase
    const { data, error } = await supabase
      .from('webhook_logs')
      .insert([{
        event_type: event_type || 'generic',
        payload: req.body,
        received_at: new Date().toISOString(),
        user_id: user_id || null
      }]);
    
    if (error) {
      console.error('Database log error:', error);
    }
    
    // Process different event types
    switch (event_type) {
      case 'profile_created':
        await handleProfileCreated(user_id, profile_data);
        break;
      case 'matching_request':
        await handleMatchingRequest(user_id, profile_data);
        break;
      case 'test_webhook':
        console.log('Test webhook processed successfully');
        break;
      default:
        console.log('Unknown event type:', event_type);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      event_type: event_type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Profile processing webhook
app.post('/webhook/profile', async (req, res) => {
  try {
    const { user_id, profile_data, action } = req.body;
    
    console.log(`Profile webhook: ${action} for user ${user_id}`);
    
    // Process profile updates
    if (action === 'analyze') {
      // Trigger AI analysis workflow
      await triggerProfileAnalysis(user_id, profile_data);
    }
    
    res.json({
      success: true,
      message: 'Profile webhook processed',
      user_id: user_id,
      action: action
    });
    
  } catch (error) {
    console.error('Profile webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Matching webhook
app.post('/webhook/matching', async (req, res) => {
  try {
    const { user_id, preferences, trigger_matching } = req.body;
    
    console.log(`Matching webhook for user ${user_id}`);
    
    if (trigger_matching) {
      // Trigger matching algorithm
      await triggerMatching(user_id, preferences);
    }
    
    res.json({
      success: true,
      message: 'Matching webhook processed',
      user_id: user_id
    });
    
  } catch (error) {
    console.error('Matching webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
async function handleProfileCreated(userId, profileData) {
  console.log('Processing profile creation for:', userId);
  // Add your N8N workflow trigger logic here
  // This could call N8N workflows for AI analysis, matching, etc.
}

async function handleMatchingRequest(userId, profileData) {
  console.log('Processing matching request for:', userId);
  // Add your N8N workflow trigger logic here
}

async function triggerProfileAnalysis(userId, profileData) {
  console.log('Triggering profile analysis for:', userId);
  // Integrate with N8N workflows
}

async function triggerMatching(userId, preferences) {
  console.log('Triggering matching algorithm for:', userId);
  // Integrate with N8N matching workflows
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 LuvLang Backend Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Key configured: ${!!supabaseKey}`);
});

module.exports = app;