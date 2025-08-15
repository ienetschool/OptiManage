#!/bin/bash

# Immediate Production Server Fix
# 502 error means the Node.js server on port 8080 is down

echo "🚨 FIXING 502 BAD GATEWAY ERROR"
echo "================================"
echo "Production server at 5.181.218.15:8080 is down"
echo "Deploying MySQL fixes and restarting server..."
echo ""

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Step 1: Upload MySQL-compatible files
echo "📤 UPLOADING MYSQL FIXES..."
scp server/medicalRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/
scp server/storage.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/
scp server/hrRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/
scp shared/mysql-schema.ts $PROD_USER@$PROD_HOST:$PROD_PATH/shared/

# Step 2: Restart production server
echo ""
echo "🔄 RESTARTING PRODUCTION SERVER..."
ssh $PROD_USER@$PROD_HOST << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt

echo "Killing any existing tsx processes..."
pkill -f 'tsx server/index.ts' || echo "No existing tsx processes found"
pkill -f 'node.*server' || echo "No existing node processes found"

echo "Waiting 3 seconds..."
sleep 3

echo "Starting production server with MySQL..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Waiting for server to start..."
sleep 5

echo "Checking server process..."
ps aux | grep tsx | grep -v grep

echo "Checking if port 8080 is listening..."
netstat -tlnp | grep :8080 || ss -tlnp | grep :8080

echo "Testing local server response..."
curl -s http://localhost:8080/api/dashboard | head -c 100

echo "Checking production log for errors..."
tail -20 production.log
EOF

echo ""
echo "🧪 TESTING EXTERNAL ACCESS..."
sleep 5
curl -s -w "HTTP Status: %{http_code}\n" https://opt.vivaindia.com/api/dashboard | head -c 200

echo ""
echo "✅ SERVER RESTART COMPLETE"
echo "🌐 Check: https://opt.vivaindia.com"