# OptiStore Pro - Final Production Fix

## Current Status
✅ **Development Environment**: Fully operational with all database schema fixes applied
✅ **Database Schema**: All MySQL columns added and APIs returning 200 status codes
✅ **Installation Form**: Updated with password field and made all fields editable
❌ **Production Server**: opt.vivaindia.com shows "Server not responding"

## Critical Fix Required
Your production server needs the updated database schema and PM2 restart. Here's the complete fix:

## Step 1: SSH to Production Server
```bash
ssh root@5.181.218.15
```

## Step 2: Find Application Directory
Run these commands to locate your OptiStore application:

```bash
# Check PM2 processes first
pm2 list
pm2 describe 0  # Replace 0 with actual process ID

# Find application directories
find /var/www -name "package.json" 2>/dev/null
find /home -name "package.json" 2>/dev/null
ls -la /var/www/vhosts/
```

**Most likely paths:**
- `/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/`
- `/var/www/vhosts/opt.vivaindia.com/httpdocs/`
- `/home/optistore/` or similar

## Step 3: Navigate to Application Directory
```bash
# Replace with the actual path you found above
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
```

## Step 4: Update Environment and Fix Database
```bash
# Set the correct database URL
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Add to .env file if it exists
echo "DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" >> .env
```

## Step 5: Apply Database Schema Fixes
```bash
# Method 1: Via API endpoint (if server is partially running)
curl -X POST http://localhost:8080/api/fix-mysql-schema

# Method 2: Direct MySQL commands (if API fails)
mysql -u ledbpt_optie -p opticpro << EOF
-- Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Add missing columns to invoice_items table  
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
EOF
```

## Step 6: Restart Application
```bash
# Restart all PM2 processes
pm2 restart all
pm2 reload all

# If specific process names exist
pm2 restart optistore-pro 2>/dev/null || echo "Process not found"
pm2 restart optistore 2>/dev/null || echo "Process not found"

# Check status
pm2 status
pm2 logs --lines 20
```

## Step 7: Verify Application
```bash
# Test API endpoints
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/api/appointments

# Check if application is listening on port 8080
netstat -tlnp | grep :8080
```

## Step 8: Test Domain Access
Open these URLs in your browser:
- ✅ http://opt.vivaindia.com:8080 (direct access)
- ✅ http://opt.vivaindia.com (should redirect to :8080)
- ✅ http://opt.vivaindia.com/install (installation form)

## Alternative: Complete Redeployment
If the above doesn't work, redeploy the entire application:

```bash
# Stop all processes
pm2 stop all
pm2 delete all

# Re-upload your latest application files
# Then start fresh:
npm install
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Expected Results
After completing these steps:
- ✅ opt.vivaindia.com should respond without errors
- ✅ All API endpoints should return 200 status codes
- ✅ Database queries should work without missing column errors
- ✅ Installation form should be accessible and functional

## Troubleshooting
If still not working:
1. Check PM2 logs: `pm2 logs --lines 50`
2. Check MySQL connection: `mysql -u ledbpt_optie -p opticpro`
3. Verify port 8080: `netstat -tlnp | grep :8080`
4. Check firewall: `firewall-cmd --list-ports`

---
**Status**: Ready for production server manual intervention
**Next**: SSH to production and run the above commands step by step