# Manual Production Start - Bypass app.js Issues

## Issue: app.js File Not Updated on Production Server
The production server still shows the old CommonJS version of app.js with "require is not defined" errors.

## Direct Start Commands (Skip app.js)

```bash
# Navigate to application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop all PM2 processes
pm2 stop all
pm2 delete all

# Set environment variables
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Install dependencies
npm install

# Build the application
npm run build

# Start directly with npm (bypass app.js completely)
npm start &

# Check if it's working
sleep 5
curl http://localhost:8080/
netstat -tlnp | grep :8080

# If npm start works, use PM2 with npm
pm2 start npm --name "optistore-npm" -- start
pm2 save

# Final test
curl http://localhost:8080/api/dashboard
curl -I http://opt.vivaindia.com:8080/
```

## Alternative: Use tsx Directly

```bash
# Set environment
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production  
export PORT=8080

# Start with tsx (TypeScript runtime)
npx tsx server/index.ts &

# Check if working
sleep 3
curl http://localhost:8080/

# If working, use PM2 with tsx
pm2 start "npx tsx server/index.ts" --name "optistore-tsx"
pm2 save
```

## Expected Success Indicators
- `npm start` should show "serving on port 8080" message
- `curl http://localhost:8080/` returns HTML content
- `netstat -tlnp | grep :8080` shows Node.js process
- opt.vivaindia.com:8080 becomes accessible

## Why This Works
- Bypasses the problematic app.js file completely  
- Uses the correct npm scripts from package.json
- Leverages the built dist/index.js or tsx runtime directly