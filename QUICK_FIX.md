# Quick Fix for 500 Error - Simple Approach

## Issue: Still getting 500 error despite proxy configuration

## Simple Solution: Use Port 8080 with Simple Apache Proxy

### Step 1: Switch back to port 8080 (confirmed working)
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="8080" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

### Step 2: Clear ALL nginx directives in Plesk

### Step 3: Add simple Apache configuration only:
```apache
ProxyPass / http://127.0.0.1:8080/
ProxyPassReverse / http://127.0.0.1:8080/
```

### Step 4: Test Result
Visit http://opt.vivaindia.com - should now work without port number

## Why This Should Work
- Port 8080 was confirmed working with direct access
- Simple Apache proxy is most reliable in Plesk
- Eliminates nginx conflicts completely

## Alternative: Accept Port Access
If proxy continues to fail, the application is fully functional at:
http://opt.vivaindia.com:8080

This is a common setup for many production applications and works perfectly for your medical practice management system.