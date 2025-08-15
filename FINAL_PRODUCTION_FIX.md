# OptiStore Pro - Final Production Access Fix

## Current Status
✅ PM2 Process Running: optistore-main (44.1mb memory)
✅ Installation Page Working: opt.vivaindia.com/install
❌ Port 8080 Access: HTTPS security warning / timeout

## Root Cause
The application is running but port 8080 might not be properly bound or accessible externally.

## Solution Commands
Run these commands in SSH terminal as root user:

```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Check current PM2 status
pm2 status
pm2 logs optistore-main --lines 5

# Check port binding
netstat -tlnp | grep :8080
ss -tlnp | grep :8080

# Test local access
curl -I http://localhost:8080/
curl -I http://127.0.0.1:8080/

# Restart with explicit port binding
pm2 delete optistore-main
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0
pm2 start "npm run dev" --name "optistore-main" --env NODE_ENV=production --env PORT=8080 --env HOST=0.0.0.0

# Wait and test
sleep 10
curl -I http://localhost:8080/

# Check firewall (if needed)
firewall-cmd --list-ports
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd --reload
```

## Access URLs After Fix
- **Main Application**: http://opt.vivaindia.com:8080 (use HTTP, not HTTPS)
- **Installation**: http://opt.vivaindia.com/install  
- **Direct IP**: http://5.181.218.15:8080

## Note
Click "Continue to site" on HTTPS warning or use HTTP directly.