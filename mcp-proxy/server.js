import express from 'express';
const app = express();

// Guaranteed health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    app: 'mcp-proxy',
    time: new Date().toISOString() 
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(5679, '0.0.0.0', () => {  // Explicitly bind to all interfaces
  console.log('Health-enabled server running on port 5679');
});
