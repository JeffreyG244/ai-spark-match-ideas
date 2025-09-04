import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API endpoints for webhooks (for N8N integration)
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
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 LuvLang server running on port ${port}`);
  console.log(`📁 Serving frontend from ${join(__dirname, 'dist')}`);
});