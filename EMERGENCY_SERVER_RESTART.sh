#!/bin/bash

# Emergency Production Server Restart
echo "🚨 EMERGENCY SERVER RESTART - FIXING 502 ERROR"
echo "==============================================="

# Production server connection details
PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "Connecting to production server..."
echo "Host: $PROD_HOST"
echo "Path: $PROD_PATH"
echo "MySQL: opticpro database"
echo ""

# SSH commands to restart the server
ssh $PROD_USER@$PROD_HOST << EOF
echo "Current directory:"
pwd
cd $PROD_PATH
echo "Changed to: \$(pwd)"

echo ""
echo "Checking for existing processes:"
ps aux | grep tsx || echo "No tsx processes found"

echo ""
echo "Killing any existing server processes:"
pkill -f 'tsx server/index.ts' || echo "No processes to kill"
pkill -f 'node.*server' || echo "No node processes to kill"
sleep 3

echo ""
echo "Starting production server with MySQL:"
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='$DATABASE_URL' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Server started! PID: \$!"

echo ""
echo "Waiting 10 seconds for server to initialize..."
sleep 10

echo ""
echo "Checking server processes:"
ps aux | grep tsx | grep -v grep || echo "Server not running yet"

echo ""
echo "Checking server logs:"
tail -n 20 production.log || echo "No logs yet"

echo ""
echo "Testing server response on localhost:"
curl -s -w "\\nHTTP Status: %{http_code}\\n" http://localhost:8080/api/dashboard | head -c 200

echo ""
echo "Testing port 8080 directly:"
netstat -tlnp | grep :8080 || echo "Port 8080 not listening"

echo ""
echo "Server restart complete!"
EOF

echo ""
echo "Testing external access:"
sleep 5
curl -s -w "\nHTTP Status: %{http_code}\n" https://opt.vivaindia.com/api/dashboard | head -c 200