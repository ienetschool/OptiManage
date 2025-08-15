# Production Server Debug - Connection Timeout Issue

## Current Status
❌ **Website**: opt.vivaindia.com:8080 shows "This site can't be reached - ERR_CONNECTION_TIMED_OUT"
✅ **PM2 Process**: optistore-main running but not accessible
❌ **Port 8080**: Not listening or blocked

## Root Cause Analysis
The application is running in PM2 but not listening on port 8080, likely due to:
1. Missing dependencies (Express module not found)
2. Application configuration issues
3. Database connection failures
4. Port binding problems

## Immediate Fix Commands for SSH Terminal

### Step 1: Check Current Process Status
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pm2 logs optistore-main --lines 20
```

### Step 2: Stop Current Process
```bash
pm2 stop optistore-main
pm2 delete optistore-main
```

### Step 3: Install All Dependencies
```bash
npm install
npm install express typescript tsx @types/node @types/express
npm install @neondatabase/serverless drizzle-orm mysql2
```

### Step 4: Set Environment Variables
```bash
export NODE_ENV=production
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro
EOF
```

### Step 5: Fix Database Schema
```bash
mysql -u ledbpt_optie -pg79h94LAP opticpro << 'EOF'
-- Add all missing columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'scheduled';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_notes TEXT;

ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);

-- Verify tables exist
SHOW TABLES;
DESCRIBE appointments;
DESCRIBE invoice_items;
EOF
```

### Step 6: Build and Start Application
```bash
# Build the application
npm run build

# Start with PM2 using ecosystem file or direct command
pm2 start "npm run start" --name optistore-main
# OR if no start script exists:
pm2 start "tsx server/index.ts" --name optistore-main

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 7: Verify Application
```bash
# Wait for startup
sleep 10

# Check if port 8080 is listening
netstat -tlnp | grep :8080

# Check PM2 status
pm2 status

# Check recent logs
pm2 logs optistore-main --lines 20

# Test API endpoints
curl -v http://localhost:8080/api/dashboard
curl -v http://localhost:8080
```

### Step 8: Firewall Check (if still not accessible)
```bash
# Check firewall status
firewall-cmd --state
firewall-cmd --list-ports

# Add port 8080 if needed
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --reload
```

## Expected Results
After these commands:
✅ Port 8080 should be listening
✅ http://opt.vivaindia.com:8080 should load the application
✅ PM2 logs should show successful startup without errors
✅ Database queries should work without missing column errors

## Troubleshooting Commands
If still not working:
```bash
# Check if Node.js app is actually running
ps aux | grep node

# Check what's using port 8080
lsof -i :8080

# Manual start for debugging
NODE_ENV=production PORT=8080 tsx server/index.ts
```