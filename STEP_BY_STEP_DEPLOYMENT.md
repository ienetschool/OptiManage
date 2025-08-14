# Step-by-Step Production Deployment Fix

## Issue Identified
- Port 8080 showing "connection timed out"
- PM2 process may not be running on production server
- Application working in Replit development but not on production server

## Step-by-Step Solution

### Step 1: Check Current PM2 Status
```bash
pm2 status
pm2 logs optistore-pro
```

### Step 2: Restart Production Application
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="8080" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
pm2 startup
```

### Step 3: Verify Process is Running
```bash
pm2 status
curl http://localhost:8080
```

### Step 4: Check Firewall Settings
```bash
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### Step 5: Test External Access
```bash
curl http://opt.vivaindia.com:8080
```

## Alternative: Use Different Port
If 8080 continues to have issues, try port 3000:
```bash
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="3000" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

Then update the redirect file:
```bash
sed -i 's/8080/3000/g' /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/index.html
```

## Expected Result
After running these commands:
- PM2 process should show "online" status
- Application should be accessible at http://opt.vivaindia.com:8080
- All medical practice features should work correctly