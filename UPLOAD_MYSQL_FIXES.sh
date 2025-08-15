#!/bin/bash

# Complete MySQL Fix Deployment Script
echo "=== DEPLOYING MYSQL COMPATIBILITY FIXES ==="

# Production server details
PROD_HOST="5.181.218.15"
PROD_USER="vivassh" 
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"

echo "🎯 Target: MySQL Database on $PROD_HOST"
echo "📍 Database: mysql://ledbpt_optie:***@localhost:3306/opticpro"
echo ""

echo "📦 Files with MySQL Fixes:"
echo "✅ server/medicalRoutes.ts - Patient registration with auto-generated codes"
echo "✅ server/storage.ts - All .returning() calls removed for MySQL"
echo "✅ server/hrRoutes.ts - HR forms fixed for MySQL"
echo "✅ shared/mysql-schema.ts - MySQL schema validation"
echo ""

echo "🔄 Production Deployment Commands:"
echo "# 1. Copy fixed files to production"
echo "scp server/medicalRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/"
echo "scp server/storage.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/"
echo "scp server/hrRoutes.ts $PROD_USER@$PROD_HOST:$PROD_PATH/server/"
echo "scp shared/mysql-schema.ts $PROD_USER@$PROD_HOST:$PROD_PATH/shared/"
echo ""

echo "# 2. Restart production server with MySQL"
echo "ssh $PROD_USER@$PROD_HOST << 'EOF'"
echo "cd $PROD_PATH"
echo "pkill -f 'tsx server/index.ts'"
echo "NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &"
echo "ps aux | grep tsx"
echo "EOF"
echo ""

echo "# 3. Test MySQL forms after deployment"
echo "curl -X POST https://opt.vivaindia.com/api/patients -H 'Content-Type: application/json' -d '{\"firstName\":\"TestMySQL\",\"lastName\":\"Patient\",\"phone\":\"1234567890\",\"email\":\"mysql@test.com\"}'"
echo ""

echo "🗄️ MYSQL ONLY - NO POSTGRESQL"
echo "✅ All .returning() PostgreSQL syntax removed"
echo "✅ Schema imports fixed to use mysql-schema.ts"
echo "✅ Patient codes auto-generated for MySQL"
echo "✅ Form validations updated for MySQL compatibility"