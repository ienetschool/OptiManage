#!/bin/bash

# Final deployment to production server
echo "🚀 DEPLOYING OPTISTORE PRO TO PRODUCTION"
echo "========================================"

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.sql"

# Upload files with auto-accept SSH key
echo "📤 Uploading files..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
  --exclude=node_modules --exclude=.git --exclude=attached_assets \
  ./ $PROD_USER@$PROD_HOST:$PROD_PATH/

# Setup and start server
echo "🔧 Starting production server..."
ssh -o StrictHostKeyChecking=no $PROD_USER@$PROD_HOST << 'SSHEOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Kill existing processes
pkill -f tsx 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 3

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install --production
fi

# Build client
if [ -d "client" ]; then
    cd client && npm run build && cd ..
    mkdir -p server/public
    cp -r client/dist/* server/public/ 2>/dev/null || true
fi

# Start server with MySQL database
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &

SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 10

# Test server
echo "Testing server status..."
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server process is running"
    curl -s --max-time 5 http://localhost:8080/api/dashboard | head -c 100 || echo "API not responding yet"
    netstat -tlnp | grep :8080 && echo "✅ Port 8080 listening" || echo "Port 8080 not ready"
else
    echo "❌ Server process failed"
    tail -10 production.log 2>/dev/null || echo "No logs available"
fi
SSHEOF

echo "🧪 Testing external access..."
sleep 5
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null https://opt.vivaindia.com/api/dashboard)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS: opt.vivaindia.com is now working!"
else
    echo "❌ Still getting HTTP $HTTP_CODE - server may need more time to start"
fi