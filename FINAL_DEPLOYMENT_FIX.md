# Final Production Deployment Fix

## Issue Identified
PM2 process shows "online" but application is not binding to port 8080. All connection attempts return "Connection refused".

## Root Cause Analysis
The application is likely:
1. Starting but immediately crashing
2. Not properly binding to port 8080
3. Missing environment variables
4. Database connection failing

## Complete Fix Commands

```bash
# Navigate to application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop and delete all PM2 processes
pm2 stop all
pm2 delete all

# Set all required environment variables
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080
export HOST=0.0.0.0

# Test database connection first
mysql -h localhost -u ledbpt_optie -pg79h94LAP opticpro -e "SELECT COUNT(*) FROM stores;"

# Start application manually to see errors
node app.js

# If manual start works, then use PM2
pm2 start app.js --name "optistore-main" --env production --max-memory-restart 200M

# Check logs immediately
pm2 logs optistore-main --lines 50

# Verify port binding
netstat -tlnp | grep :8080
lsof -i :8080
```

## Alternative Startup Methods

If `node app.js` fails, try:
```bash
# Check if package.json has start script
cat package.json | grep -A 5 "scripts"

# Try npm start
npm start

# Try different entry points
node index.js
node server.js
node server/index.js
```

## Plesk Configuration Fix

In Plesk panel for opt.vivaindia.com:
1. **Application Startup File**: Try different entry points:
   - `app.js` (current)
   - `index.js`
   - `server.js` 
   - `server/index.js`
2. **Environment Variables**: Add in Plesk:
   - `DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro`
   - `NODE_ENV=production`
   - `PORT=8080`

## Success Indicators
When working properly:
- `curl http://localhost:8080/` returns HTML content
- `netstat -tlnp | grep :8080` shows Node.js process
- PM2 logs show "Server started on port 8080"
- opt.vivaindia.com:8080 accessible externally