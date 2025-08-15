# ✅ Correct SSH Commands - Fixed Path

## Issue with Your Command
You used: `/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/`
Correct path is: `/var/www/vhosts/opt.vivaindia.com/httpdocs/`

## Corrected Commands

### Quick Fix (Single Command):
```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 status && pm2 start ecosystem.config.js && pm2 status && curl -s http://localhost:8080/api/stores"
```

### Step-by-Step Method:
```bash
# 1. Connect
ssh root@5.181.218.15

# 2. Navigate to correct directory
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/

# 3. Check current PM2 status
pm2 status

# 4. Start the application
pm2 start ecosystem.config.js

# 5. Verify it's running
pm2 status

# 6. Test API endpoint
curl http://localhost:8080/api/stores
```

### Alternative Start Commands:
```bash
# If ecosystem.config.js doesn't exist, try:
pm2 start npm --name "optistore" -- start

# Or direct node start:
pm2 start server/index.js --name "optistore"

# Or manual start:
npm start &
```

### Add Missing Database Columns:
```bash
mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE store_inventory ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS store_id VARCHAR(36);
EOF
```

## Expected Results:
- PM2 shows application as "online"
- curl returns JSON with store data
- https://opt.vivaindia.com loads successfully
- Dashboard shows data without 500 errors

## Troubleshooting:
If the correct path doesn't work, check what's actually in your server:
```bash
ssh root@5.181.218.15 "find /var/www -name '*opt*' -type d"
```

This will show you the exact location of your OptiStore Pro files.