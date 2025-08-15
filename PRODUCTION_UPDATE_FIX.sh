#!/bin/bash

# Complete Production Update and Fix
echo "🔧 UPDATING PRODUCTION SERVER WITH MYSQL FIXES"
echo "=============================================="

# Upload all MySQL-compatible files
echo "📤 Uploading MySQL-compatible files..."
scp server/medicalRoutes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/ 2>/dev/null || echo "medicalRoutes.ts upload failed"
scp server/storage.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/ 2>/dev/null || echo "storage.ts upload failed"
scp server/hrRoutes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/ 2>/dev/null || echo "hrRoutes.ts upload failed"
scp server/db.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/ 2>/dev/null || echo "db.ts upload failed"
scp shared/mysql-schema.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/shared/ 2>/dev/null || echo "mysql-schema.ts upload failed"

# Restart production server
echo "🔄 Restarting production server..."
ssh vivassh@5.181.218.15 << 'EOF' 2>/dev/null || echo "SSH connection failed"
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f 'tsx server/index.ts'
sleep 3
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &
sleep 5
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep :8080
tail -10 production.log
curl -s http://localhost:8080/api/dashboard | head -c 100
EOF

echo "✅ Production update attempt complete"