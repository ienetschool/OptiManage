# 🚀 Start Here - Copy These Exact Commands

## Quick Fix for opt.vivaindia.com

Copy and paste these commands one by one:

### 1. Connect to your server:
```bash
ssh root@5.181.218.15
```

### 2. Navigate to application:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

### 3. Test MySQL endpoint (this should fail with 404):
```bash
curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"
```

### 4. Check what's running:
```bash
pm2 status
```

### 5. Test database connection directly:
```bash
mysql -h localhost -u ledbpt_optie -p opticpro
```
**Password:** `g79h94LAP`

If connected, type: `SHOW TABLES;` then `exit`

### 6. Deploy missing columns to database:
```bash
mysql -h localhost -u ledbpt_optie -p opticpro -e "
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE store_inventory ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
"
```

### 7. Restart application:
```bash
pm2 restart all
```

### 8. Test the website:
Go to: https://opt.vivaindia.com

The application should now work without 500 errors!

---

## What This Does:
- Adds missing database columns that are causing 500 errors
- Fixes the "Unknown column" errors in products, patients, customers, etc.
- Keeps your existing data intact
- Makes the application fully functional

After running these commands, your OptiStore Pro should work perfectly!