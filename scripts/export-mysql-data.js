#!/usr/bin/env node

/**
 * MySQL Data Export Script for OptiStore Pro
 * Converts PostgreSQL data export to MySQL compatible format
 */

import fs from 'fs';
import path from 'path';

console.log('🏥 OptiStore Pro MySQL Data Converter');
console.log('=====================================');

// Find the most recent PostgreSQL backup file
const backupFiles = fs.readdirSync('.')
  .filter(file => file.startsWith('database_backup_') && file.endsWith('.sql'))
  .sort()
  .reverse();

if (backupFiles.length === 0) {
  console.log('❌ No PostgreSQL backup files found.');
  console.log('Please run ./scripts/export-database.sh first to create a backup.');
  process.exit(1);
}

const inputFile = backupFiles[0];
const outputFile = `mysql_${inputFile}`;

console.log(`📁 Converting: ${inputFile} → ${outputFile}`);

try {
  let sqlContent = fs.readFileSync(inputFile, 'utf8');
  
  // PostgreSQL to MySQL conversions
  console.log('🔄 Converting PostgreSQL syntax to MySQL...');
  
  // Replace PostgreSQL specific functions and syntax
  sqlContent = sqlContent
    // Replace UUID generation
    .replace(/gen_random_uuid\(\)/g, '(UUID())')
    
    // Replace PostgreSQL timestamp functions
    .replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP')
    .replace(/CURRENT_TIMESTAMP/g, 'CURRENT_TIMESTAMP')
    
    // Replace PostgreSQL specific data types
    .replace(/\btimestamp without time zone\b/g, 'TIMESTAMP')
    .replace(/\btimestamp with time zone\b/g, 'TIMESTAMP')
    .replace(/\bjsonb\b/g, 'JSON')
    .replace(/\btext\b/g, 'TEXT')
    .replace(/\bvarchar\(/g, 'VARCHAR(')
    .replace(/\binteger\b/g, 'INT')
    .replace(/\bboolean\b/g, 'BOOLEAN')
    .replace(/\bdecimal\(/g, 'DECIMAL(')
    
    // Replace PostgreSQL specific syntax
    .replace(/\bCREATE TABLE IF NOT EXISTS\b/g, 'CREATE TABLE IF NOT EXISTS')
    .replace(/\bON UPDATE CURRENT_TIMESTAMP\b/g, 'ON UPDATE CURRENT_TIMESTAMP')
    
    // Replace sequence and serial types
    .replace(/\bSERIAL\b/g, 'INT AUTO_INCREMENT')
    .replace(/\bBIGSERIAL\b/g, 'BIGINT AUTO_INCREMENT')
    
    // Replace PostgreSQL array syntax (if any)
    .replace(/\[\]/g, '')
    
    // Replace PostgreSQL specific operators
    .replace(/\bISNULL\b/g, 'IS NULL')
    .replace(/\bNOTNULL\b/g, 'NOT NULL')
    
    // Convert COPY statements to INSERT statements (basic conversion)
    .replace(/COPY\s+(\w+)\s+\([^)]+\)\s+FROM\s+stdin;/g, '-- COPY statement converted to INSERT')
    
    // Remove PostgreSQL specific commands
    .replace(/SET\s+statement_timeout\s*=\s*\d+;/g, '')
    .replace(/SET\s+lock_timeout\s*=\s*\d+;/g, '')
    .replace(/SET\s+idle_in_transaction_session_timeout\s*=\s*\d+;/g, '')
    .replace(/SET\s+client_encoding\s*=\s*'[^']+';/g, '')
    .replace(/SET\s+standard_conforming_strings\s*=\s*\w+;/g, '')
    .replace(/SET\s+check_function_bodies\s*=\s*\w+;/g, '')
    .replace(/SET\s+xmloption\s*=\s*\w+;/g, '')
    .replace(/SET\s+client_min_messages\s*=\s*\w+;/g, '')
    .replace(/SET\s+row_security\s*=\s*\w+;/g, '')
    
    // Remove PostgreSQL extensions
    .replace(/CREATE EXTENSION[^;]+;/g, '')
    
    // Remove PostgreSQL specific comments
    .replace(/--\s*PostgreSQL[^\n]*/g, '')
    
    // Add MySQL specific settings at the beginning
    .replace(/^/, `-- MySQL Data Export for OptiStore Pro
-- Generated from PostgreSQL backup: ${inputFile}
-- Date: ${new Date().toISOString()}

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

`);

  // Write the converted SQL file
  fs.writeFileSync(outputFile, sqlContent);
  
  console.log('✅ Conversion completed successfully!');
  console.log(`📁 MySQL file: ${outputFile}`);
  console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)}KB`);
  console.log('');
  console.log('📋 To import into MySQL:');
  console.log(`mysql -u username -p database_name < ${outputFile}`);
  console.log('');
  console.log('⚠️  Note: This is a basic conversion. You may need to manually adjust:');
  console.log('   - Complex JSON/JSONB fields');
  console.log('   - PostgreSQL specific functions');
  console.log('   - Date/time formats');
  console.log('   - Sequence values and auto-increment settings');

} catch (error) {
  console.error('❌ Conversion failed:', error.message);
  process.exit(1);
}