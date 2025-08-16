#!/bin/bash

echo "STABLE PM2 SOLUTION FOR PRODUCTION"
echo "=================================="

echo "Based on your screenshots, PM2 starts but crashes immediately."
echo "Try these solutions in order:"
echo ""

echo "SOLUTION 1: Check crash logs"
echo "pm2 logs optistore-production --lines 50"
echo ""

echo "SOLUTION 2: Use node instead of tsx"
echo "pm2 delete optistore-production"
echo "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 pm2 start \"node --loader tsx/esm server/index.ts\" --name optistore-production"
echo "pm2 save"
echo ""

echo "SOLUTION 3: Install dependencies and fix permissions"
echo "npm install"
echo "npm install -g tsx@latest"
echo "chown -R vivassh:psacln ."
echo "chmod -R 755 ."
echo ""

echo "SOLUTION 4: Alternative start method"
echo "DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 pm2 start npm --name optistore-production -- start"
echo ""

echo "SOLUTION 5: Manual verification first"
echo "DATABASE_URL=\"mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro\" PORT=8080 tsx server/index.ts"
echo "# If this works, then create PM2 process"
echo ""

echo "FINAL TEST:"
echo "curl http://localhost:8080/api/dashboard"
echo "pm2 status"
echo ""

echo "Expected result: PM2 shows 'online' and stays stable, curl returns JSON data"