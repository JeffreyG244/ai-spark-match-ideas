const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

app.use(cors());
app.use(express.json());

// Serve static files from dist directory - THIS IS THE KEY CHANGE
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY
    }
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'LuvLang Backend',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/webhook', '/webhook/profile', '/webhook/matching']
  });
});

// Webhook endpoints
app.post('/webhook', async (req, res) => {
  try {
    const { event_type, user_id, profile_data } = req.body;
    console.log('Webhook received:', { event_type, user_id });
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      event_type: event_type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/webhook/profile', async (req, res) => {
  try {
    const { user_id, profile_data, action } = req.body;
    console.log(`Profile webhook: ${action} for user ${user_id}`);
    
    if (action === 'analyze') {
      console.log('Triggering AI profile analysis for:', user_id);
    }
    
    res.json({
      success: true,
      message: 'Profile webhook processed',
      user_id: user_id,
      action: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/webhook/matching', async (req, res) => {
  try {
    const { user_id, preferences, trigger_matching } = req.body;
    console.log(`Matching webhook for user ${user_id}`);
    
    if (trigger_matching) {
      console.log('Triggering matching algorithm for:', user_id);
    }
    
    res.json({
      success: true,
      message: 'Matching webhook processed',
      user_id: user_id,
      preferences: preferences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 LuvLang Backend running on port ${port}`);
  console.log(`📁 Serving frontend from ${path.join(__dirname, 'dist')}`);
});