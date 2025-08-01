# OptiStore Pro - MySQL Deployment Guide

## Overview
This guide helps you migrate OptiStore Pro from PostgreSQL to MySQL for deployment on servers that support MySQL with phpMyAdmin access.

## MySQL Configuration Files

### Primary MySQL Files:
1. **`drizzle.mysql.config.ts`** - MySQL-specific Drizzle configuration
2. **`server/mysql-db.ts`** - MySQL database connection setup
3. **`shared/mysql-schema.ts`** - Complete MySQL schema definition
4. **`scripts/mysql-migration.sh`** - Automated migration script

## Prerequisites

### Server Requirements:
- **MySQL** 5.7+ or **MariaDB** 10.3+
- **Node.js** 18+
- **phpMyAdmin** (for database management)
- **PM2** (recommended for process management)

### Required Environment Variables:

Create a `.env` file:

```env
# MySQL Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/optistorepro

# Alternative MySQL Variables
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=optistorepro

# Node Environment
NODE_ENV=production

# Session Secret
SESSION_SECRET=your-random-session-secret-here
```

## Migration Process

### Step 1: Prepare MySQL Database

#### Option A: Using phpMyAdmin
1. Open phpMyAdmin in your browser
2. Create a new database named `optistorepro`
3. Set collation to `utf8mb4_unicode_ci`

#### Option B: Using MySQL CLI
```bash
mysql -u root -p
CREATE DATABASE optistorepro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON optistorepro.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

### Step 2: Run Migration Script

```bash
# Make the migration script executable
chmod +x scripts/mysql-migration.sh

# Run the automated migration
./scripts/mysql-migration.sh
```

The script will:
- Test MySQL connection
- Generate MySQL schema
- Create all tables in your database
- Set up proper relationships and indexes

### Step 3: Convert and Import Data

```bash
# Convert PostgreSQL backup to MySQL format
node scripts/export-mysql-data.js

# Import the converted data (replace with your actual file name)
mysql -u your_username -p optistorepro < mysql_database_backup_20250801_145407.sql
```

### Step 4: Update Application Configuration

Modify `server/index.ts` to use MySQL:

```typescript
// Replace the PostgreSQL import
// import { db } from "./db";

// With MySQL import
import { db } from "./mysql-db";

// Rest of the file remains the same
```

Update `package.json` scripts (add MySQL-specific commands):

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:push:mysql": "drizzle-kit push --config=drizzle.mysql.config.ts",
    "db:generate:mysql": "drizzle-kit generate --config=drizzle.mysql.config.ts"
  }
}
```

## Database Schema Differences

### Key Changes from PostgreSQL to MySQL:

1. **UUID Generation**: `gen_random_uuid()` → `UUID()`
2. **JSON Fields**: `jsonb` → `json`
3. **Text Fields**: PostgreSQL `text` → MySQL `TEXT`
4. **Timestamps**: Unified to MySQL `TIMESTAMP`
5. **Auto-increment**: PostgreSQL sequences → MySQL `AUTO_INCREMENT`

### Table Structure:

All tables are created with:
- **Primary Keys**: VARCHAR(36) for UUID compatibility
- **Timestamps**: `created_at`, `updated_at` with proper defaults
- **JSON Fields**: For flexible custom data storage
- **Proper Indexes**: For optimal query performance

## phpMyAdmin Management

### Accessing Your Database:
1. Open phpMyAdmin in your browser
2. Select the `optistorepro` database
3. View tables and data

### Key Tables to Monitor:
- **`users`** - System users and authentication
- **`patients`** - Patient records and medical data
- **`appointments`** - Appointment scheduling
- **`medical_appointments`** - Medical consultation records
- **`stores`** - Store locations and settings
- **`prescriptions`** - Medical prescriptions
- **`sales`** - Sales transactions

### Backup in phpMyAdmin:
1. Select your database
2. Go to "Export" tab
3. Choose "Quick" export method
4. Select "SQL" format
5. Click "Go" to download backup

## Production Deployment

### 1. Install Dependencies
```bash
npm install --production
```

### 2. Build Application
```bash
npm run build
```

### 3. Start with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name "optistore-pro"

# Configure auto-restart on server reboot
pm2 startup
pm2 save
```

### 4. Environment Configuration

Create production `.env`:
```env
NODE_ENV=production
DATABASE_URL=mysql://your_user:your_password@localhost:3306/optistorepro
SESSION_SECRET=your-super-secure-random-string
PORT=3000
```

## Troubleshooting

### Common MySQL Issues:

1. **Connection Refused**
   - Check MySQL service: `sudo systemctl status mysql`
   - Verify credentials in DATABASE_URL

2. **Authentication Failed**
   - Ensure user has proper privileges
   - Check password in connection string

3. **Table Creation Errors**
   - Verify database character set: `utf8mb4`
   - Check MySQL version compatibility

4. **JSON Field Issues**
   - Ensure MySQL 5.7+ for native JSON support
   - For older versions, fields will be stored as TEXT

### Migration Validation:

```sql
-- Check if all tables were created
SHOW TABLES;

-- Verify table structure
DESCRIBE patients;
DESCRIBE appointments;
DESCRIBE users;

-- Check data import
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM appointments;
```

## File Structure Summary

```
OptiStore Pro/
├── drizzle.mysql.config.ts     # MySQL Drizzle config
├── server/
│   ├── mysql-db.ts             # MySQL connection
│   └── index.ts                # Express server (update imports)
├── shared/
│   └── mysql-schema.ts         # MySQL schema definition
├── scripts/
│   ├── mysql-migration.sh      # Automated migration
│   └── export-mysql-data.js    # Data conversion
├── mysql_database_backup_*.sql # Converted MySQL data
└── .env                        # MySQL environment variables
```

## Performance Optimization

### MySQL Configuration:
```ini
# Add to my.cnf or my.ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 150
query_cache_size = 64M
query_cache_type = 1
```

### Indexing Strategy:
The schema includes optimized indexes for:
- Patient lookups by code
- Appointment date ranges
- Store-based queries
- User authentication

## Security Considerations

1. **Database User**: Create dedicated user with minimal required privileges
2. **Network**: Restrict MySQL access to localhost only
3. **Backups**: Regular automated backups via cron
4. **SSL**: Enable SSL for database connections in production

## Support

This MySQL version maintains all OptiStore Pro functionality:
- ✅ Patient Management
- ✅ Appointment Scheduling
- ✅ Medical Records
- ✅ QR Code Generation
- ✅ Invoice Management
- ✅ Store Management
- ✅ User Authentication
- ✅ Comprehensive Reporting

The system is now fully compatible with MySQL servers and phpMyAdmin administration.