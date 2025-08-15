#!/bin/bash

echo "🚀 UPLOADING MYSQL FIXES TO PRODUCTION"
echo "======================================"

# Upload the fixed MySQL-compatible files
scp server/medicalRoutes.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
scp server/storage.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
scp server/hrRoutes.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
scp server/routes.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
scp server/db.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
scp shared/mysql-schema.ts root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/shared/

# Restart production server
ssh root@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
sudo fuser -k 8080/tcp
pkill -f 'tsx server/index.ts'
sleep 5
NODE_ENV=production PORT=8080 DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' tsx server/index.ts > production.log 2>&1 &
sleep 10
ps aux | grep tsx | grep -v grep
curl -s http://localhost:8080/api/patients -X POST -H "Content-Type: application/json" -d '{"firstName":"ProductionTest","lastName":"User","phone":"9999999999","email":"prod@test.com"}'
EOF

echo "✅ Production server updated and restarted"