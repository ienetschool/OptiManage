#!/bin/bash
echo "🚀 DEPLOYING MYSQL-COMPATIBLE CODE TO PRODUCTION"
echo "=============================================="

# Upload all MySQL-compatible files to production
echo "Uploading medicalRoutes.ts..."
scp -o StrictHostKeyChecking=no server/medicalRoutes.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/

echo "Uploading storage.ts..."
scp -o StrictHostKeyChecking=no server/storage.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/

echo "Uploading hrRoutes.ts..."
scp -o StrictHostKeyChecking=no server/hrRoutes.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/

echo "Uploading db.ts..."
scp -o StrictHostKeyChecking=no server/db.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/

echo "Uploading mysql-schema.ts..."
scp -o StrictHostKeyChecking=no shared/mysql-schema.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/shared/

# Execute production server update commands
echo "Updating production server..."
ssh -o StrictHostKeyChecking=no root@5.181.218.15 << 'DEPLOY_EOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Set MySQL database URL
echo 'DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro"' > .env

# Remove all PostgreSQL syntax
find server/ -name "*.ts" -exec sed -i 's/\.returning([^)]*)//' {} \;
find server/ -name "*.ts" -exec sed -i 's/\.returning()//' {} \;

# Kill existing server
pkill -f 'tsx server/index.ts'
sudo fuser -k 8080/tcp
sleep 5

# Start production server with MySQL
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" NODE_ENV=production PORT=8080 tsx server/index.ts > production.log 2>&1 &

# Wait for startup
sleep 15

# Verify server is running
ps aux | grep tsx | grep -v grep

# Test MySQL connection
curl -s -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"firstName":"DEPLOYED","lastName":"MySQL","phone":"9999999999","email":"deployed@mysql.com"}' | head -c 300

echo "Production deployment complete"
DEPLOY_EOF

echo "✅ All MySQL-compatible code deployed to production server"