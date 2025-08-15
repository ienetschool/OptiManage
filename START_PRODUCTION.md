# Production Server Start Guide

## Issue Fixed
The `app.js` file was using CommonJS (`require`) but the project is configured as ES module. Fixed by converting to ES module syntax.

## Production Start Commands

```bash
# Navigate to application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Clean PM2 processes
pm2 stop all
pm2 delete all

# Set environment variables
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Test the fixed app.js
node app.js

# If that works, start with PM2
pm2 start app.js --name "optistore-main"

# Alternative: Use npm start directly
pm2 start npm --name "optistore-npm" -- start

# Save PM2 configuration
pm2 save

# Test the application
curl http://localhost:8080/
curl http://localhost:8080/api/dashboard
```

## Expected Results
After these fixes:
- `node app.js` should start without ES module errors
- Application should bind to port 8080
- `curl http://localhost:8080/` should return HTML content
- opt.vivaindia.com:8080 should be accessible

## Verification Steps
1. Check PM2 status: `pm2 status` (should show "online")
2. Check port: `netstat -tlnp | grep :8080` (should show Node.js process)
3. Test locally: `curl http://localhost:8080/` (should return HTML)
4. Test externally: Visit opt.vivaindia.com:8080 in browser