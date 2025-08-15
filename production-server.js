const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    totalPatients: 0,
    totalAppointments: 0,
    totalSales: 0,
    message: 'OptiStore Pro Medical Practice Management',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth/user', (req, res) => {
  res.json({ 
    id: "admin", 
    email: "admin@optistore.com", 
    name: "OptiStore Administrator",
    role: "admin"
  });
});

app.get('/api/patients', (req, res) => {
  res.json([]);
});

app.get('/api/appointments', (req, res) => {
  res.json([]);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OptiStore Pro',
    port: 8080,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'OptiStore Pro - Medical Practice Management System',
    status: 'Server Running',
    version: '1.0.0',
    apis: {
      dashboard: '/api/dashboard',
      patients: '/api/patients',
      appointments: '/api/appointments',
      health: '/health'
    }
  });
});

app.get('*', (req, res) => {
  res.json({ 
    message: 'OptiStore Pro API Server',
    status: 'Running',
    requestPath: req.path
  });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`OptiStore Pro server running on port ${port}`);
  console.log(`Server started at ${new Date().toISOString()}`);
});
