# phpMyAdmin Setup Guide for OptiStore Pro

## Quick Setup Instructions

### Step 1: Create MySQL Database in phpMyAdmin

1. **Open phpMyAdmin** in your web browser (usually at `http://your-server/phpmyadmin`)
2. **Login** with your MySQL credentials
3. **Create Database:**
   - Click "New" in the left sidebar
   - Database name: `optistorepro`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

### Step 2: Import Database Structure

**Method A: Using SQL Tab**
1. Select your `optistorepro` database
2. Click the "SQL" tab
3. Copy and paste the MySQL schema creation commands
4. Click "Go"

**Method B: Using Import**
1. Select your `optistorepro` database
2. Click "Import" tab
3. Choose the MySQL backup file: `mysql_database_backup_complete.sql`
4. Click "Go"

### Step 3: Verify Tables Created

After import, you should see these tables:
- `users` - System users and authentication
- `patients` - Patient records
- `appointments` - General appointments
- `medical_appointments` - Medical consultations
- `stores` - Store locations
- `doctors` - Medical practitioners
- `prescriptions` - Medical prescriptions
- `sales` - Sales transactions
- `products` - Product catalog
- `customers` - Customer information

### Step 4: Configure Application

Update your `.env` file with MySQL connection:
```env
DATABASE_URL=mysql://your_username:your_password@localhost:3306/optistorepro
```

## Database Management in phpMyAdmin

### Common Operations:

**View Data:**
- Click on any table name to see its data
- Use "Browse" tab to view records
- Use "Search" tab to find specific records

**Add Sample Data:**
- Click "Insert" tab on any table
- Fill in the form fields
- Click "Go" to save

**Backup Database:**
- Select your database
- Click "Export" tab
- Choose "Quick" method
- Click "Go" to download

**Monitor Performance:**
- Click "Status" tab to see database statistics
- Check "Processes" for active connections
- View "Query cache" for performance metrics

### Security Settings:

**Recommended Settings:**
1. Change default phpMyAdmin URL
2. Enable HTTPS for phpMyAdmin access
3. Create dedicated MySQL user for the application
4. Limit phpMyAdmin access by IP address

## Application Connection Setup

### Update Server Configuration:

Replace PostgreSQL imports with MySQL in `server/index.ts`:

```typescript
// Change this line:
// import { db } from "./db";

// To this:
import { db } from "./mysql-db";
```

### Test Database Connection:

You can test the connection by running:
```bash
node -e "
import('./server/mysql-db.js').then(({ db }) => {
  console.log('Testing MySQL connection...');
  // Test query here
}).catch(console.error);
"
```

## Troubleshooting

### Common Issues:

**Cannot connect to phpMyAdmin:**
- Check if MySQL service is running
- Verify phpMyAdmin is installed and configured
- Check firewall settings

**Import fails:**
- Check file size limits in phpMyAdmin
- Verify MySQL user has necessary privileges
- Check for syntax errors in SQL file

**Application cannot connect:**
- Verify DATABASE_URL format
- Check MySQL user permissions
- Ensure database name matches exactly

### MySQL User Privileges:

Create a dedicated user for your application:
```sql
CREATE USER 'optistore_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON optistorepro.* TO 'optistore_user'@'localhost';
FLUSH PRIVILEGES;
```

## Next Steps

1. **Setup phpMyAdmin** on your server
2. **Import the database** using the MySQL backup file
3. **Update application** to use MySQL connection
4. **Test the connection** and verify functionality
5. **Configure backups** for regular data protection

Your OptiStore Pro system will then be fully operational with MySQL and phpMyAdmin management capabilities.