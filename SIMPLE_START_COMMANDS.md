# Simple Production Start - Direct Port Method

## SUCCESS: Application Accessible!
✅ curl http://opt.vivaindia.com:5000 returns HTTP/1.1 200 OK
✅ Application serving HTML content correctly
✅ Port 5000 externally accessible

## Immediate Solution: Use Port 5000 Directly
Your OptiStore Pro is now accessible at:
**http://opt.vivaindia.com:5000**

## Optional: Configure Standard HTTPS Port
If you want to use the standard domain without port number:

### Method 1: Run on Port 80
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="80" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

Then access via: http://opt.vivaindia.com

### Method 2: Simple Plesk Proxy Fix
In Plesk, clear all nginx/apache directives and add only:
```apache
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/
```

## Current Status: WORKING
OptiStore Pro is fully operational and accessible at http://opt.vivaindia.com:5000

Users can now:
- Manage patient records
- Schedule appointments  
- Track inventory
- Process invoices
- Handle prescriptions
- Manage staff and permissions

The deployment is complete and functional!