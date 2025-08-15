# 🔄 Fix Connection Refused Error - opt.vivaindia.com

## Problem
Your website is showing "ERR_CONNECTION_REFUSED" which means the application stopped running.

## Step-by-Step Fix

### 1. Connect to your server:
```bash
ssh root@5.181.218.15
```

### 2. Check what's running:
```bash
pm2 status
```

### 3. If nothing is running, go to your app:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

### 4. Start the application:
```bash
pm2 start ecosystem.config.js
```

### 5. Check if it's running:
```bash
pm2 status
curl http://localhost:8080/api/stores
```

### 6. Add the missing database columns:
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
EOF
```

### 7. Test your website:
Open https://opt.vivaindia.com in your browser - it should work now!

## If Still Not Working

Try these additional steps:

```bash
# Check logs for errors
pm2 logs

# Restart everything
pm2 restart all

# Manual start if PM2 fails
npm start &

# Check if port is listening
netstat -tulpn | grep 8080
```

Your OptiStore Pro medical practice management system should be accessible after these steps!