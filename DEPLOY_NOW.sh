#!/bin/bash
# Immediate deployment to fix 502 error
echo "Deploying MySQL fixes to production server..."
scp server/medicalRoutes.ts server/storage.ts server/hrRoutes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/server/ 2>/dev/null || echo "Upload failed - SSH connection issue"
scp shared/mysql-schema.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/shared/ 2>/dev/null || echo "Schema upload failed"
ssh vivassh@5.181.218.15 'cd /var/www/vhosts/vivaindia.com/opt && pkill -f tsx && NODE_ENV=production PORT=8080 DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" nohup npx tsx server/index.ts > production.log 2>&1 & sleep 3 && ps aux | grep tsx' 2>/dev/null || echo "Server restart failed"