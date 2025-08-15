# OptiStore Pro - Immediate Production Fix

## Current Production Server Status (from your screenshot)
✅ **PM2 Process**: `optistore-main` is running online (18.6MB memory)  
✅ **Server Location**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/`  
✅ **Node.js**: v20.19.4 active  
❌ **Port 8080**: Connection refused errors  
❌ **Express Module**: Module not found error  

## Immediate Fix Commands
Run these commands in your SSH terminal (you're already connected):

### Step 1: Install Missing Dependencies
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
npm install express
npm install typescript tsx
npm install --save-dev @types/node @types/express
```

### Step 2: Update Environment Variables
```bash
export NODE_ENV=production
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
echo "NODE_ENV=production" > .env
echo "DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" >> .env
```

### Step 3: Fix Database Schema (Critical)
```bash
mysql -u ledbpt_optie -pg79h94LAP opticpro << 'EOF'
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
EOF
```

### Step 4: Restart Application
```bash
pm2 restart optistore-main
pm2 logs optistore-main --lines 20
```

### Step 5: Test the Application
```bash
# Wait 10 seconds for startup
sleep 10

# Test if port 8080 is active
netstat -tlnp | grep :8080

# Test API endpoints
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/api/appointments
```

## Expected Results After Fix
✅ Port 8080 should be listening  
✅ http://opt.vivaindia.com:8080 should load the application  
✅ http://opt.vivaindia.com should redirect properly  
✅ All API endpoints should return data without errors  

## If Still Having Issues
Run this diagnostic:
```bash
pm2 logs optistore-main --lines 50
cat package.json | grep -A5 -B5 "scripts"
ls -la server/
node --version
npm --version
```

The main issues appear to be missing Express dependency and incorrect port configuration. Once these are fixed, your application should be fully operational.