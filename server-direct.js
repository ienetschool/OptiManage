// Complete OptiStore Pro Server - Direct Upload Version
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
});

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'ledbpt_optie',
  password: 'g79h94LAP',
  database: 'opticpro',
  acquireTimeout: 10000,
  timeout: 10000
};

// Test database connection
async function testDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    const [appointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
    const [invoices] = await connection.execute('SELECT COUNT(*) as count FROM invoices');
    
    await connection.end();
    
    res.json({
      totalPatients: patients[0]?.count || 0,
      totalAppointments: appointments[0]?.count || 0,
      totalSales: invoices[0]?.count || 0,
      message: 'OptiStore Pro - Medical Practice Management System',
      database: 'MySQL Connected',
      server: 'Production Ready'
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.json({
      totalPatients: 0,
      totalAppointments: 0,
      totalSales: 0,
      message: 'OptiStore Pro Server Running',
      database: 'Connecting...',
      server: 'Ready',
      error: error.message
    });
  }
});

// Patients API
app.get('/api/patients', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT id, patient_code, first_name, last_name, phone, email, 
             DATE_FORMAT(created_at, '%Y-%m-%d') as created_date
      FROM patients 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Patients API error:', error);
    res.status(500).json({ 
      message: 'Database error', 
      error: error.message,
      patients: []
    });
  }
});

// Appointments API
app.get('/api/appointments', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT a.*, p.first_name, p.last_name, d.name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC 
      LIMIT 100
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Appointments API error:', error);
    res.json([]);
  }
});

// Auth API (production mock)
app.get('/api/auth/user', (req, res) => {
  res.json({ 
    id: "admin", 
    email: "admin@optistore.com", 
    name: "OptiStore Admin",
    role: "administrator"
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'OptiStore Pro',
    timestamp: new Date().toISOString(),
    database: 'MySQL',
    port: process.env.PORT || 8080
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: 'OptiStore Pro - Medical Practice Management System',
      status: 'Server Running',
      api: {
        dashboard: '/api/dashboard',
        patients: '/api/patients',
        appointments: '/api/appointments',
        health: '/health'
      },
      database: `${dbConfig.user}@${dbConfig.host}:3306/${dbConfig.database}`
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'production' ? 'Contact administrator' : err.message 
  });
});

// Start server
const port = process.env.PORT || 8080;

async function startServer() {
  console.log('🚀 Starting OptiStore Pro Server...');
  console.log(`📊 Database: ${dbConfig.user}@${dbConfig.host}:3306/${dbConfig.database}`);
  
  await testDatabase();
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ OptiStore Pro server running on port ${port}`);
    console.log(`🌐 Access: http://localhost:${port}`);
    console.log(`📡 API: http://localhost:${port}/api/dashboard`);
  });
}

startServer().catch(console.error);