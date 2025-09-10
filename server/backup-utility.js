const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: '5.181.218.15',
  port: 3306,
  user: 'ledbpt_optie',
  password: 'g79h94LAP',
  database: 'opticpro'
};

/**
 * Create a MySQL database backup
 * @param {string} outputPath - Path where backup file will be saved
 */
async function createDatabaseBackup(outputPath = null) {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = timestamp.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
  
  const defaultFileName = `backup-${dbConfig.database}-${dateStr}-${timeStr}.sql`;
  const backupPath = outputPath || path.join(__dirname, defaultFileName);
  
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📋 Fetching database schema...');
    
    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    let backupContent = [
      '-- MySQL Database Backup',
      `-- Database: ${dbConfig.database}`,
      `-- Generated on: ${timestamp.toISOString().slice(0, 19).replace('T', ' ')}`,
      `-- Host: ${dbConfig.host}:${dbConfig.port}`,
      '-- ------------------------------------------------------',
      '',
      'SET NAMES utf8mb4;',
      'SET FOREIGN_KEY_CHECKS = 0;',
      'SET UNIQUE_CHECKS = 0;',
      "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';",
      '',
      `-- Create database if not exists`,
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      `USE \`${dbConfig.database}\`;`,
      ''
    ].join('\n');
    
    console.log(`📊 Found ${tables.length} tables to backup`);
    
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`🔄 Backing up table: ${tableName}`);
      
      // Get CREATE TABLE statement
      const [createResult] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      const createStatement = createResult[0]['Create Table'];
      
      backupContent += `-- Table structure for ${tableName}\n`;
      backupContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      backupContent += createStatement + ';\n\n';
      
      // Get table data
      const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        backupContent += `-- Data for table ${tableName}\n`;
        backupContent += `INSERT INTO \`${tableName}\` VALUES\n`;
        
        const values = rows.map(row => {
          const valueArray = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            return value;
          });
          return `(${valueArray.join(', ')})`;
        });
        
        backupContent += values.join(',\n') + ';\n\n';
      }
    }
    
    backupContent += [
      '-- Enable foreign key checks',
      'SET FOREIGN_KEY_CHECKS = 1;',
      'SET UNIQUE_CHECKS = 1;',
      '',
      '-- Backup completed successfully',
      `-- Total tables backed up: ${tables.length}`,
      `-- Backup file: ${path.basename(backupPath)}`
    ].join('\n');
    
    // Write backup to file
    await fs.writeFile(backupPath, backupContent, 'utf8');
    
    console.log(`✅ Database backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Tables backed up: ${tables.length}`);
    console.log(`📏 Backup file size: ${(await fs.stat(backupPath)).size} bytes`);
    
    return {
      success: true,
      filePath: backupPath,
      tablesCount: tables.length,
      timestamp: timestamp.toISOString()
    };
    
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: timestamp.toISOString()
    };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

/**
 * Schedule automatic backups
 * @param {string} schedule - Cron-like schedule (e.g., 'daily', 'weekly')
 */
async function scheduleBackup(schedule = 'daily') {
  const backupDirectory = path.join(__dirname, 'backups');
  
  try {
    await fs.mkdir(backupDirectory, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
  
  const result = await createDatabaseBackup(
    path.join(backupDirectory, `scheduled-backup-${dbConfig.database}-${Date.now()}.sql`)
  );
  
  return result;
}

// Export functions for use in other modules
module.exports = {
  createDatabaseBackup,
  scheduleBackup
};

// If run directly, create a backup
if (require.main === module) {
  createDatabaseBackup()
    .then(result => {
      console.log('Backup operation completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Backup script failed:', error);
      process.exit(1);
    });
}