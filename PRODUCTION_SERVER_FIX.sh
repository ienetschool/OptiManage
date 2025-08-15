#!/bin/bash

# Complete Production Server Fix with MySQL Deployment
echo "🚀 DEPLOYING MYSQL FIXES AND RESTARTING PRODUCTION SERVER"
echo "=========================================================="

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# First, deploy all MySQL-fixed files
echo "1. Deploying latest MySQL-compatible code..."
rsync -avz --exclude=node_modules --exclude=.git --exclude=attached_assets \
  ./ $PROD_USER@$PROD_HOST:$PROD_PATH/

# Then restart the server properly
echo ""
echo "2. Restarting production server with MySQL configuration..."
ssh $PROD_USER@$PROD_HOST << EOF
cd $PROD_PATH
echo "Current directory: \$(pwd)"

# Kill existing processes thoroughly
echo "Killing existing processes..."
pkill -9 -f tsx 2>/dev/null || echo "No tsx processes found"
pkill -9 -f node 2>/dev/null || echo "No node processes found"
pkill -9 -f "server/index" 2>/dev/null || echo "No server processes found"
sleep 5

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Start server with full error logging
echo "Starting server with MySQL configuration..."
NODE_ENV=production \
PORT=8080 \
FORCE_PRODUCTION=true \
DATABASE_URL='$DATABASE_URL' \
nohup npx tsx server/index.ts > production.log 2>&1 &

SERVER_PID=\$!
echo "Server started with PID: \$SERVER_PID"

# Wait for server to start
echo "Waiting for server initialization..."
sleep 15

# Check if server is running
if ps -p \$SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server process is running"
else
    echo "❌ Server process failed to start"
    echo "Last 20 lines of production.log:"
    tail -20 production.log
    exit 1
fi

# Test server response
echo "Testing server response..."
for i in {1..5}; do
    echo "Attempt \$i:"
    if curl -s --max-time 5 http://localhost:8080/api/dashboard > /dev/null; then
        echo "✅ Server responding on localhost:8080"
        break
    else
        echo "⏳ Server not ready yet, waiting..."
        sleep 3
    fi
done

# Check listening ports
echo "Checking listening ports:"
netstat -tlnp | grep :8080 || echo "❌ Port 8080 not listening"

# Show recent logs
echo "Recent server logs:"
tail -10 production.log

echo "Production server deployment complete!"
EOF

# Test external access
echo ""
echo "3. Testing external access..."
sleep 5
for i in {1..3}; do
    echo "External test attempt $i:"
    HTTP_CODE=$(curl -s -w "%{http_code}" https://opt.vivaindia.com/api/dashboard -o /dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ External access working! HTTP $HTTP_CODE"
        break
    else
        echo "❌ External access failed: HTTP $HTTP_CODE"
        sleep 5
    fi
done

echo ""
echo "Production server fix complete!"