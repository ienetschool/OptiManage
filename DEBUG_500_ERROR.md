# Debug 500 Error - OptiStore Pro

## Current Status
- Getting 500 error on opt.vivaindia.com
- Need to check if application is running and responding

## Diagnostic Steps

### 1. Check if PM2 process is running
```bash
pm2 status
pm2 logs optistore-pro --lines 50
```

### 2. Test local application response
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
curl -v http://localhost:5000
```

### 3. Check if application starts manually
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
node dist/index.js
```

### 4. Check port availability
```bash
netstat -tulpn | grep :5000
lsof -i :5000
```

### 5. Check Plesk error logs
```bash
tail -f /var/log/httpd/error_log
tail -f /var/log/nginx/error.log
```

### 6. Restart everything in order
```bash
# Stop PM2
pm2 stop optistore-pro
pm2 delete optistore-pro

# Start fresh
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 start dist/index.js --name optistore-pro

# Check status
pm2 status
pm2 logs optistore-pro
```

### 7. Test direct port access
Try visiting: http://opt.vivaindia.com:5000
(If this works, proxy issue. If not, app issue)

## Common Issues
1. **App not starting**: Database connection error
2. **Port conflict**: Another service using port 5000
3. **Proxy misconfiguration**: Plesk not forwarding correctly
4. **File permissions**: Application files not readable
5. **Node.js version**: Compatibility issues

## Quick Fix Commands
```bash
# Check if app runs
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
npm start

# If it works, restart PM2
pm2 restart optistore-pro

# Check proxy
curl -H "Host: opt.vivaindia.com" http://localhost:5000
```