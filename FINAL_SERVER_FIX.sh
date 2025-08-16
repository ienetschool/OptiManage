#!/bin/bash

echo "FINAL PRODUCTION SERVER FIX"
echo "============================"

# Create a simple production deployment package
echo "Creating production deployment package..."
tar -czf production_deploy.tar.gz server/ package.json tsconfig.json ecosystem.config.js

echo ""
echo "MANUAL STEPS TO COMPLETE:"
echo "========================="
echo ""
echo "1. Copy the production_deploy.tar.gz to your production server"
echo "2. SSH into production: ssh root@5.181.218.15"
echo "3. Navigate: cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "4. Extract: tar -xzf production_deploy.tar.gz"
echo "5. Install: npm install && npm install -g tsx pm2"
echo "6. Stop old: pkill -f tsx && sudo fuser -k 8080/tcp"
echo "7. Start new: pm2 start ecosystem.config.js"
echo "8. Save PM2: pm2 save && pm2 startup"
echo "9. Test: curl http://localhost:8080/api/dashboard"
echo ""
echo "OR use this single command in SSH:"
echo "DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 tsx server/index.ts"
echo ""
echo "Deployment package ready: production_deploy.tar.gz"