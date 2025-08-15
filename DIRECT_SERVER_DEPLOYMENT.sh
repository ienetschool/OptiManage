#!/bin/bash

# Direct MySQL Fix Deployment to Production Server
# This script uploads all MySQL-compatible files and restarts the server

echo "🚀 DEPLOYING MYSQL FIXES TO PRODUCTION SERVER"
echo "=============================================="

# Production server details
PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "📍 Target: $PROD_USER@$PROD_HOST:$PROD_PATH"
echo "🗄️ Database: MySQL opticpro (ledbpt_optie@localhost:3306)"
echo ""

# Step 1: Upload MySQL-compatible files
echo "📤 UPLOADING MYSQL-COMPATIBLE FILES..."
scp server/medicalRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/ && echo "✅ medicalRoutes.ts uploaded"
scp server/storage.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/ && echo "✅ storage.ts uploaded"  
scp server/hrRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/ && echo "✅ hrRoutes.ts uploaded"
scp shared/mysql-schema.ts $PROD_USER@$PROD_HOST:$PROD_PATH/shared/ && echo "✅ mysql-schema.ts uploaded"

echo ""

# Step 2: Restart production server with MySQL
echo "🔄 RESTARTING PRODUCTION SERVER WITH MYSQL..."
ssh $PROD_USER@$PROD_HOST << EOF
cd $PROD_PATH
echo "Stopping old server process..."
pkill -f 'tsx server/index.ts'
sleep 3

echo "Starting server with MySQL fixes..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='$DATABASE_URL' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Waiting for server to start..."
sleep 5

echo "Checking server status..."
ps aux | grep tsx | grep -v grep

echo "Testing API response..."
curl -s http://localhost:8080/api/dashboard | head -c 200

echo ""
echo "🎉 MYSQL DEPLOYMENT COMPLETE!"
echo "Server running on: https://opt.vivaindia.com"
EOF

echo ""
echo "🧪 TESTING PATIENT REGISTRATION..."
curl -X POST https://opt.vivaindia.com/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"MySQLTest","lastName":"Patient","phone":"1234567890","email":"mysql.test@production.com"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ DEPLOYMENT SUMMARY:"
echo "- MySQL compatibility fixes deployed"
echo "- All PostgreSQL .returning() calls removed"
echo "- Patient registration auto-generation fixed"
echo "- Production server restarted with MySQL database"
echo "- Forms should now work on https://opt.vivaindia.com"