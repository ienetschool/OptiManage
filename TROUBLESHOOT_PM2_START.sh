#!/bin/bash

echo "PM2 TROUBLESHOOTING GUIDE"
echo "========================="

echo ""
echo "Your nginx configuration looks correct, but still getting 502 errors."
echo "This means the PM2 process is not properly starting or listening."
echo ""
echo "Run these diagnostic commands in SSH:"
echo ""

echo "1. Check PM2 process status:"
echo "   pm2 status"
echo ""

echo "2. View startup logs for errors:"
echo "   pm2 logs optistore-production --lines 30"
echo ""

echo "3. Check if port 8080 is actually listening:"
echo "   netstat -tlnp | grep 8080"
echo ""

echo "4. If no process listening, check for errors:"
echo "   cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "   DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 tsx server/index.ts"
echo ""

echo "5. Common issues and fixes:"
echo "   - Missing tsx: npm install -g tsx"
echo "   - Missing deps: npm install"
echo "   - Wrong path: verify you're in correct directory"
echo "   - Port in use: kill any existing process on 8080"
echo ""

echo "6. Once manual start works, create PM2 process:"
echo "   pm2 delete optistore-production"
echo "   DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 pm2 start tsx --name optistore-production -- server/index.ts"
echo "   pm2 save"
echo ""

echo "7. Final verification:"
echo "   curl http://localhost:8080/api/dashboard"
echo ""

echo "Expected working output:"
echo "- PM2 shows 'online' status"
echo "- Manual start shows 'serving on port 8080'"
echo "- netstat shows process on port 8080"
echo "- curl returns JSON medical data"