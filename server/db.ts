import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "../shared/mysql-schema.ts";

// Use MySQL database from secrets or fallback to direct connection
const DATABASE_URL = process.env.DATABASE_URL || "mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`Connecting to MySQL database: ${DATABASE_URL.includes('mysql://') ? 'MySQL Server' : 'Database Server'}`);

// Create MySQL connection pool with enhanced configuration
export const connection = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Drizzle database instance
export const db = drizzle(connection, { 
  schema, 
  mode: 'default',
  logger: process.env.NODE_ENV === 'development'
});

// Test database connection
export async function testConnection() {
  try {
    const conn = await connection.getConnection();
    console.log('✅ MySQL database connected successfully');
    conn.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}

// Initialize database connection
export async function initializeDatabase() {
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to MySQL database');
  }
  return db;
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const [result] = await connection.execute('SELECT 1 AS health_check, NOW() AS server_time');
    return { 
      healthy: true, 
      timestamp: new Date().toISOString(),
      result 
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      healthy: false, 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await connection.end();
    console.log('✅ MySQL connection pool closed');
  } catch (error) {
    console.error('❌ Error closing MySQL connection:', error);
  }
}

// Database statistics
export async function getDatabaseStats() {
  try {
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'opticpro'
      ORDER BY DATA_LENGTH DESC
    `);
    
    const [connections] = await connection.execute('SHOW STATUS LIKE "Threads_connected"');
    
    return {
      tables,
      connections,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return null;
  }
}