# Final Proxy Fix - Working Solution

## Current Status
✅ Application running on port 80 (perfect for standard domain access)
❌ Plesk proxy still showing error page instead of application

## Root Cause Analysis
The issue is that Plesk is intercepting requests before they reach your application. Since your app is now on port 80, we need to disable Plesk's default handling.

## Solution: Disable Plesk Document Root Serving

### Method 1: Change Document Root in Plesk
1. In Plesk panel: Websites & Domains > opt.vivaindia.com > Hosting Settings
2. Change "Document root" from default to: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`
3. Uncheck "Smart static files processing" if enabled
4. Apply changes

### Method 2: Use Different Port and Simple Proxy
If Method 1 doesn't work:

```bash
# Change back to port 3000 (less likely to conflict)
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="3000" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

Then in Plesk Apache directives:
```apache
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

### Method 3: Disable Apache/Nginx for this Domain
In Plesk: 
- Websites & Domains > opt.vivaindia.com > Apache & nginx Settings
- Disable "Proxy mode" if enabled
- Set to serve static files only

The key is preventing Plesk from interfering with your Node.js application.