# Exact SSH Commands to Fix Production Server

## Current Issue
- npm install failed because it's running from /root instead of the application directory
- Need to navigate to the correct directory first
- package.json is not in /root, it's in the application directory

## Run These Exact Commands in SSH Terminal

```bash
# 1. Navigate to the correct application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# 2. Verify we're in the right place
pwd
ls -la package.json

# 3. Now install dependencies from the correct directory
npm install

# 4. Install specific missing modules
npm install express typescript tsx @types/node @types/express mysql2

# 5. Set environment variables
export NODE_ENV=production
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# 6. Create .env file in the application directory
echo "NODE_ENV=production" > .env
echo "PORT=8080" >> .env
echo "DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" >> .env

# 7. Fix database schema
mysql -u ledbpt_optie -pg79h94LAP opticpro -e "
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;
"

# 8. Stop the old broken process
pm2 stop optistore-main
pm2 delete optistore-main

# 9. Start the application properly
pm2 start "tsx server/index.ts" --name optistore-main

# 10. Check if it's working
sleep 5
pm2 status
pm2 logs optistore-main --lines 15
netstat -tlnp | grep :8080
```

## Key Points
1. **Always run `cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql` first**
2. **Verify you're in the right directory with `pwd` and `ls -la package.json`**
3. **Then run npm commands**

The npm install failed because you were in `/root` directory instead of the application directory where package.json exists.