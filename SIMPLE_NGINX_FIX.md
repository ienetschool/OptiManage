# Simple Production Fix - Root Cause Analysis

## Problem Identified
The application is built as a TypeScript project that needs compilation, but production server is trying to run `app.js` which doesn't exist or isn't the correct entry point.

## Development vs Production Structure
- **Development**: Uses `tsx server/index.ts` (TypeScript runtime)
- **Production**: Needs compiled JavaScript or proper Node.js startup

## Quick Production Fix Commands

```bash
# Navigate to application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Check what files actually exist
ls -la
ls -la server/

# Install dependencies if missing
npm install

# Build the application for production
npm run build || tsc || echo "No build script found"

# Set environment variables
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Try different startup approaches
# Option 1: Use tsx if available
npx tsx server/index.ts &

# Option 2: Use npm start script
npm start &

# Option 3: Use node if JS files exist
node server/index.js &

# Check if any approach worked
sleep 3
curl http://localhost:8080/
netstat -tlnp | grep :8080
```

## Plesk Configuration Update
Once you identify the working startup command, update Plesk:
1. **Application Startup File**: Use the working entry point
2. **NPM Script**: If npm start works, use that instead of direct file

## Expected Result
After finding the correct startup method, the application should bind to port 8080 and be accessible via opt.vivaindia.com:8080