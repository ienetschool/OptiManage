# Manual Database Fix - Application Already Running

## Current Status
Your application is running but may be in a different location. Let's add the missing database columns directly:

## Database Fix Command
```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro -e \"ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100); ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255); ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20); ALTER TABLE store_inventory ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0; ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36); ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100); ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50); ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20); ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS store_id VARCHAR(36);\""
```

## Alternative Paths to Check
Based on your find results, try these locations:
```bash
# Check optistore-app directory
ssh root@5.181.218.15 "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app && ls -la"

# Check if PM2 is running from this location
ssh root@5.181.218.15 "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app && pm2 status"
```

## Test Website
After adding database columns:
```bash
curl https://opt.vivaindia.com
```

The application should work without 500 errors once the database columns are added.