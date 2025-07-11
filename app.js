const express = require('express');
const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook route
const githubWebhook = require('./routes/githubWebhook');
app.use('/api/github-webhook', githubWebhook);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
