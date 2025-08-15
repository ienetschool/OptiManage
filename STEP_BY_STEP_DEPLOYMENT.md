# Step-by-Step Production Deployment Fix

## Current Situation
- Your OptiStore Pro application is running (PM2 shows online status)
- The issue is missing database columns causing 500 errors
- Multiple directory paths exist on your server

## Step 1: Add Missing Database Columns
Run this command to fix the database:
```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE store_inventory ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS store_id VARCHAR(36);
EOF"
```

## Step 2: Test the Website
After running the database command:
1. Open https://opt.vivaindia.com in your browser
2. Check if the dashboard loads without errors
3. Try navigating to Patients, Products, and Inventory pages

## Step 3: Verify Application Location
If you need to restart or modify the application:
```bash
# Check which directory has the running application
ssh root@5.181.218.15 "ps aux | grep node"

# Or check PM2 process details
ssh root@5.181.218.15 "pm2 show optistore-pro"
```

## Expected Results
- No more 500 errors on the website
- Patient management fully functional
- Product inventory loading properly
- Customer data displaying correctly
- Medical practice dashboard operational

Your OptiStore Pro deployment will be complete!