#!/bin/bash

# Production Server Restart with MySQL Fixes
echo "🔄 RESTARTING PRODUCTION SERVER WITH MYSQL FIXES"
echo "================================================="

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "Target: $PROD_USER@$PROD_HOST:$PROD_PATH"
echo "MySQL: ledbpt_optie@localhost:3306/opticpro"
echo ""

# The 502 error indicates the server is not running
# Let's restart it with the MySQL configuration

echo "Commands to run on production server:"
echo "======================================"
echo ""
echo "ssh $PROD_USER@$PROD_HOST << 'EOF'"
echo "cd $PROD_PATH"
echo "echo 'Checking current processes...'"
echo "ps aux | grep tsx"
echo ""
echo "echo 'Stopping any existing server...'"
echo "pkill -f 'tsx server/index.ts'"
echo "sleep 3"
echo ""
echo "echo 'Starting server with MySQL...'"
echo "NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='$DATABASE_URL' nohup npx tsx server/index.ts > production.log 2>&1 &"
echo ""
echo "echo 'Waiting for server to start...'"
echo "sleep 5"
echo ""
echo "echo 'Checking server status...'"
echo "ps aux | grep tsx | grep -v grep"
echo ""
echo "echo 'Testing server response...'"
echo "curl -s http://localhost:8080/api/dashboard | head -c 100"
echo "EOF"
echo ""
echo "After restart, test with:"
echo "curl https://opt.vivaindia.com/api/dashboard"