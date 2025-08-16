#!/bin/bash

echo "=== PRODUCTION SERVER RESTART SCRIPT ==="
echo "This will restart your production server at opt.vivaindia.com"
echo ""

# SSH into production and restart server
ssh root@5.181.218.15 << 'ENDSSH'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "1. Checking current server status..."
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep 8080

echo ""
echo "2. Stopping any existing server processes..."
pkill -f tsx
sudo fuser -k 8080/tcp
sleep 2

echo ""
echo "3. Checking for recent errors..."
tail -10 production.log

echo ""
echo "4. Starting server in background..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts > production.log 2>&1 &

sleep 3

echo ""
echo "5. Verifying server is running..."
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep 8080

echo ""
echo "6. Testing server response..."
curl -s http://localhost:8080/api/dashboard | head -c 100

echo ""
echo "=== Server restart complete ==="
ENDSSH

echo ""
echo "Testing external access..."
curl -s "https://opt.vivaindia.com/api/dashboard" | head -c 100