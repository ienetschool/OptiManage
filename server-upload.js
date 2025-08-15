// Simple Node.js server for production
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'ledbpt_optie',
  password: 'g79h94LAP',
  database: 'opticpro'
};

// API Routes
app.get('/api/dashboard', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    const [appointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
    await connection.end();
    
    res.json({
      totalPatients: patients[0].count,
      totalAppointments: appointments[0].count,
      totalSales: 0,
      message: 'OptiStore Pro Running'
    });
  } catch (error) {
    res.json({
      totalPatients: 0,
      totalAppointments: 0,
      totalSales: 0,
      message: 'Server Running - DB Connection Pending'
    });
  }
});

// Patient API
app.get('/api/patients', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM patients LIMIT 10');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Static files
app.use(express.static('public'));

// Catch-all for React app
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.json({ message: 'OptiStore Pro Server Running', status: 'OK' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`OptiStore Pro server running on port ${port}`);
});