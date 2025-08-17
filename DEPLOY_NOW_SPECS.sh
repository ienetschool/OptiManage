#!/bin/bash
set -e

echo '🚀 DEPLOYING SPECS WORKFLOW SPA FIX...'

# Deploy to production server
rsync -avz --progress server/routes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/

# Restart production server
ssh vivassh@5.181.218.15 'cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql && pm2 restart optistore-main'

echo '✅ DEPLOYMENT COMPLETE'
echo '🔗 Test: https://opt.vivaindia.com/specs-workflow'

# Test the deployment
sleep 3
curl -s 'https://opt.vivaindia.com/specs-workflow' | head -5
