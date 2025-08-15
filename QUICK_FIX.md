# 🚨 Production Server Down - Quick Fix

## Issue: Connection Refused
Your production server at opt.vivaindia.com is showing "ERR_CONNECTION_REFUSED" which means:
- The application is not running
- PM2 process has stopped
- Port 8080 is not accessible

## Quick Fix Commands

SSH to your server and run these commands:

```bash
ssh root@5.181.218.15
```

```bash
# Check PM2 status
pm2 status

# If no processes running, start the application
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
pm2 start ecosystem.config.js

# OR restart all processes
pm2 restart all

# Check status again
pm2 status

# Check logs for errors
pm2 logs --lines 20

# Test the application
curl http://localhost:8080/api/stores
```

## Expected Results
After running these commands:
- PM2 should show your application running
- `curl` should return JSON with your stores
- https://opt.vivaindia.com should work

## If Still Not Working
```bash
# Check if port 8080 is open
netstat -tulpn | grep 8080

# Check nginx/apache status
systemctl status nginx
systemctl status apache2

# Restart web server if needed
systemctl restart nginx
```

## Alternative: Manual Start
If PM2 isn't working:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
npm start &
```

Your OptiStore Pro should be accessible again after these steps!