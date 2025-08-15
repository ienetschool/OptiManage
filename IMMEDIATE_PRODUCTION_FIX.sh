#!/bin/bash

echo "🚨 IMMEDIATE PRODUCTION SERVER FIX"
echo "=================================="
echo "Copy and paste these commands one by one:"
echo ""

echo "1. Connect to production server:"
echo "ssh vivassh@5.181.218.15"
echo ""

echo "2. Navigate to project directory:"
echo "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo ""

echo "3. Stop any existing server process:"
echo "pkill -f 'tsx server/index.ts'"
echo ""

echo "4. Start production server with unified MySQL:"
echo "NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &"
echo ""

echo "5. Verify server is running:"
echo "ps aux | grep tsx | grep -v grep"
echo "netstat -tlnp | grep :8080"
echo ""

echo "6. Check server logs:"
echo "tail -20 production.log"
echo ""

echo "7. Test API connection:"
echo "curl -s http://localhost:8080/api/dashboard | head -c 100"
echo ""

echo "✅ After running these commands, opt.vivaindia.com should work!"
echo "Both development and production will use the same MySQL database."