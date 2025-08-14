# MySQL Database Setup for OptiStore Pro

## Current Status
✅ **MySQL Support Added** - Application converted from PostgreSQL to MySQL

## Database Configuration

### 1. Update Environment Variables
Create or update your `.env` file with your MySQL database connection:

```bash
# MySQL Database Connection
DATABASE_URL=mysql://your_username:your_password@your_host:3306/your_database_name

# Example formats:
# DATABASE_URL=mysql://root:password123@localhost:3306/optistore_pro
# DATABASE_URL=mysql://user:pass@127.0.0.1:3306/medical_db
# DATABASE_URL=mysql://dbuser:securepass@your-server.com:3306/optistore
```

### 2. Database Setup Commands
Run these commands to set up your MySQL database:

```bash
# Push the MySQL schema to your database
npm run db:push

# Or if you need to use the MySQL-specific config
npx drizzle-kit push --config=drizzle.mysql.config.ts
```

### 3. Import Sample Data (Optional)
If you need sample data for testing, we can create a MySQL-compatible data import script.

## MySQL Connection Details Needed

Please provide your MySQL database connection details:

1. **Host**: (e.g., localhost, 127.0.0.1, or your server IP)
2. **Port**: (usually 3306 for MySQL)
3. **Username**: Your MySQL database username
4. **Password**: Your MySQL database password  
5. **Database Name**: The name of your database

## MySQL Schema Features

The MySQL schema includes all OptiStore Pro features:
- ✅ Users and authentication
- ✅ Stores and inventory management
- ✅ Customers and patient records
- ✅ Doctors and medical staff
- ✅ Products and categories
- ✅ Appointments scheduling
- ✅ Prescriptions management
- ✅ Invoices and billing
- ✅ Financial tracking and accounting
- ✅ Staff roles and permissions

## Next Steps

1. **Provide Database Connection**: Share your MySQL connection details
2. **Update Environment**: We'll configure the DATABASE_URL
3. **Schema Migration**: Push the complete medical practice schema
4. **Sample Data Import**: Optionally import test data
5. **Test Connection**: Verify the application connects successfully

Your OptiStore Pro medical practice management system will then be ready with MySQL database backend!