#!/bin/bash

echo "IMMEDIATE PRODUCTION FIX - DIRECT APPROACH"
echo "=========================================="

# Create complete working deployment
echo "Creating complete production package..."

# Compress all needed files
tar -czf production_complete.tar.gz server/ package.json tsconfig.json

echo ""
echo "PRODUCTION IS DOWN - 502 Bad Gateway confirmed"
echo "=============================================="
echo ""
echo "The server process is not running on port 8080."
echo ""
echo "MANUAL FIX REQUIRED:"
echo "==================="
echo ""
echo "1. Upload production_complete.tar.gz to your server"
echo "2. SSH: ssh root@5.181.218.15"
echo "3. Navigate: cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "4. Extract: tar -xzf production_complete.tar.gz"
echo "5. Install: npm install && npm install -g tsx"
echo "6. Start: DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' PORT=8080 tsx server/index.ts &"
echo ""
echo "Your website will be online immediately after step 6."
echo ""
echo "PERMANENT SOLUTION:"
echo "=================="
echo "After the manual fix, install PM2:"
echo "npm install -g pm2"
echo "pm2 start 'DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 tsx server/index.ts' --name optistore"
echo "pm2 save"
echo "pm2 startup"
echo ""
echo "This will prevent future crashes and auto-restart the server."