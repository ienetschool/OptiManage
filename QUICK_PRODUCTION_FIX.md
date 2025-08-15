# Quick Production Server Fix

## Issues Identified from PM2 Logs:
1. **Port Conflict**: Multiple processes trying to use port 80
2. **Memory Store Warning**: Not suitable for production
3. **Multiple Failed Restarts**: Processes keep crashing

## Quick Fix Commands:

```bash
# Navigate to correct directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop all conflicting processes
pm2 stop all
pm2 delete all

# Kill any processes using port 80 and 8080
sudo fuser -k 80/tcp 2>/dev/null || echo "Port 80 clear"
sudo fuser -k 8080/tcp 2>/dev/null || echo "Port 8080 clear"

# Set environment variables
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Start fresh with single process
pm2 start app.js --name "optistore-main" --env production

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs optistore-main --lines 20
```

## Expected Result:
- Single PM2 process running on port 8080
- opt.vivaindia.com should redirect to working application
- Database connection established with MySQL

## If Still Issues:
```bash
# Check what's using ports
netstat -tlnp | grep :80
netstat -tlnp | grep :8080

# Manual start to debug
node app.js
```