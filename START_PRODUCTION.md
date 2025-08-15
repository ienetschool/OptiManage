# 🚀 Start Production Server - Complete Guide

## Current Issue
Your OptiStore Pro at opt.vivaindia.com is showing "Connection Reset" errors because the application is not running on the production server.

## Method 1: Quick PM2 Restart (Recommended)

Copy and paste this complete command:

```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 status && pm2 start ecosystem.config.js && pm2 status && curl -s http://localhost:8080/api/stores"
```

## Method 2: Step-by-Step Manual Fix

```bash
# 1. Connect to server
ssh root@5.181.218.15

# 2. Navigate to application
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/

# 3. Check PM2 status
pm2 status

# 4. Start application if not running
pm2 start ecosystem.config.js

# 5. Verify it's working
pm2 status
curl http://localhost:8080/api/stores

# 6. If successful, add missing database columns
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

## Method 3: Fresh Start (If PM2 fails)

```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 delete all && npm install && npm run build && pm2 start ecosystem.config.js"
```

## Method 4: Direct Node Start (Emergency)

```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && node server/index.js &"
```

## Expected Results

After running any of these methods:
- PM2 should show your application running
- `curl http://localhost:8080/api/stores` should return JSON data
- https://opt.vivaindia.com should load your medical practice management system

## Troubleshooting

If still not working:

```bash
# Check what's using port 8080
netstat -tulpn | grep 8080

# Check system logs
journalctl -f

# Check nginx/apache
systemctl status nginx
systemctl status apache2

# Manual port check
telnet localhost 8080
```

## Success Indicators
✅ PM2 shows "online" status
✅ curl returns store data in JSON format
✅ https://opt.vivaindia.com loads without connection errors
✅ Dashboard shows patient/product data instead of 500 errors

Your OptiStore Pro medical practice management system will be fully operational!