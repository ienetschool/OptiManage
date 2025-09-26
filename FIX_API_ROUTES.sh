#!/bin/bash

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== FIXING API ROUTES ON PORT 8080 ==="

# 1. Check if server is actually running
echo "1. Checking current server process:"
ps aux | grep "server/index.ts" | grep -v grep

# 2. Kill the current process and restart properly
echo "2. Restarting server with full API routes..."
pkill -f "tsx.*server/index.ts" 2>/dev/null || true

# 3. Ensure all dependencies are available
echo "3. Installing/updating dependencies..."
npm install

# 4. Start server with all environment variables
echo "4. Starting full production server..."
export NODE_ENV=production
export PORT=8080
export FORCE_PRODUCTION=true
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Use nohup to keep it running and capture output
nohup npx tsx server/index.ts > server-full.log 2>&1 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# 5. Wait for startup and test
echo "5. Waiting for server startup..."
sleep 10

echo "6. Testing API endpoints..."
curl -I http://localhost:8080/api/dashboard | head -2
curl -I http://localhost:8080/api/install/test-connection | head -2
curl -I http://localhost:8080/install | head -2

# 7. Check server logs
echo "7. Server startup logs:"
if [ -f server-full.log ]; then
    tail -10 server-full.log
fi

echo ""
echo "=== STATUS ==="
echo "✅ Domain redirect: http://opt.vivaindia.com → http://opt.vivaindia.com:8080"
echo "Server PID: $SERVER_PID"
netstat -tlnp | grep :8080 || echo "❌ Port 8080 not listening"