// Optimized MySQL connection pool to prevent crashes
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '5.181.218.15',
  user: 'ledbpt_optie', 
  password: 'g79h94LAP',
  database: 'opticpro',
  waitForConnections: true,
  connectionLimit: 5,        // Limit connections
  queueLimit: 0,
  acquireTimeout: 30000,     // 30 seconds
  timeout: 30000,            // 30 seconds
  reconnect: true,           // Auto-reconnect
  idleTimeout: 300000,       // 5 minutes
  maxIdle: 5
});

module.exports = pool;
