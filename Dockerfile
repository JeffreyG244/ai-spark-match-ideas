# Multi-stage build for LuvLang full-stack application
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY luvlang.org/package*.json ./
RUN npm ci --only=production
COPY luvlang.org/ ./
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install backend dependencies
COPY railway-deploy/package*.json ./
RUN npm ci --only=production

# Copy backend server
COPY railway-deploy/server.js ./
COPY railway-deploy/.env ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Create updated server to serve frontend + API
COPY <<'EOF' ./server-fullstack.js
/**
 * LuvLang Full-Stack Production Server
 * Serves React frontend + Backend API + N8N webhooks
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (existing backend functionality)
app.get('/api/health', (req, res) => {
  res.json({
    service: 'LuvLang Full-Stack',
    status: 'active',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/webhook',
      '/api/webhook/profile', 
      '/api/webhook/matching'
    ],
    frontend: 'React app served'
  });
});

// Backend API endpoints with /api prefix
app.post('/api/webhook', async (req, res) => {
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

app.post('/api/webhook/profile', async (req, res) => {
  try {
    const { user_id, profile_data, action } = req.body;
    console.log(`Profile webhook: ${action} for user ${user_id}`);
    
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

app.post('/api/webhook/matching', async (req, res) => {
  try {
    const { user_id, preferences, trigger_matching } = req.body;
    console.log(`Matching webhook for user ${user_id}`);
    
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

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 LuvLang Full-Stack Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Frontend: React app served at /`);
  console.log(`API: Backend endpoints at /api/*`);
  console.log(`Supabase: Connected to ${supabaseUrl}`);
});

module.exports = app;
EOF

# Expose port
EXPOSE 3000

# Start the full-stack server
CMD ["node", "server-fullstack.js"]