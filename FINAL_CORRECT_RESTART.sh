#!/bin/bash

# FINAL CORRECT Production Server Restart
echo "🔧 CORRECT PRODUCTION SERVER RESTART"
echo "===================================="
echo "Path: /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "Database: MySQL opticpro (ledbpt_optie@localhost:3306)"
echo ""

cat << 'EOF'
ssh vivassh@5.181.218.15 << 'REMOTE'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Killing existing processes..."
pkill -f 'tsx server/index.ts'
sleep 2

echo "Starting server with correct MySQL database..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Waiting for server to start..."
sleep 5

echo "Checking server status..."
ps aux | grep tsx | grep -v grep

echo "Testing port 8080..."
netstat -tlnp | grep :8080 || ss -tlnp | grep :8080

echo "Checking production log..."
tail -10 production.log

echo "Testing API response..."
curl -s http://localhost:8080/api/dashboard | head -c 100
REMOTE
EOF