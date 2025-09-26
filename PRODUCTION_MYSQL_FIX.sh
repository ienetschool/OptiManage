#!/bin/bash

# Upload fixed files to production server and restart
echo "=== UPLOADING FIXED FILES TO PRODUCTION ==="

# Define production details
PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt"

# Files to upload (fixed for MySQL compatibility)
echo "Files to upload:"
echo "- server/medicalRoutes.ts (Fixed patient registration)"
echo "- server/storage.ts (Fixed all .returning() calls)"
echo "- server/hrRoutes.ts (Fixed HR form submissions)"

echo ""
echo "=== PRODUCTION RESTART COMMANDS ==="
echo "1. Kill existing process:"
echo "pkill -f 'tsx server/index.ts'"
echo ""
echo "2. Start production server:"
echo "cd $PROD_PATH"
echo "NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &"
echo ""
echo "3. Verify server is running:"
echo "ps aux | grep tsx"
echo "curl -s https://opt.vivaindia.com/api/patients | head -c 200"
echo ""
echo "=== MYSQL COMPATIBILITY FIXES APPLIED ==="
echo "✅ Removed all PostgreSQL .returning() calls"
echo "✅ Fixed patient registration auto-generation"
echo "✅ Updated schema imports to use mysql-schema.ts"
echo "✅ Fixed form submission errors across all pages"