// Simple test server for production
const express = require('express');
const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.json({ 
    message: 'OptiStore Production Test Server', 
    timestamp: new Date(),
    status: 'working'
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    database: 'mysql://***@5.181.218.15:3306/opticpro',
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple test server running on port ${PORT}`);
  console.log(`Access: http://localhost:${PORT}`);
});
