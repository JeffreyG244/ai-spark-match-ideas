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

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'LuvLang server is running successfully'
  });
});

// Simple home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>LuvLang - Coming Soon</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            p { color: #666; }
        </style>
    </head>
    <body>
        <h1>🚀 LuvLang is Live!</h1>
        <p>The server is running successfully on Railway.</p>
        <p>Frontend deployment in progress...</p>
        <a href="/health">Health Check</a>
    </body>
    </html>
  `);
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

app.listen(port, () => {
  console.log(`🚀 LuvLang server running on port ${port}`);
  console.log(`🌍 Server URL: https://luvlang-backend-production.up.railway.app`);
});