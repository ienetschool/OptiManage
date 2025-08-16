#!/bin/bash

echo "DIRECT PRODUCTION SERVER DEPLOYMENT AND START"
echo "=============================================="

# Copy working server files directly to production
scp -r server/ root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/
scp package.json root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/
scp tsconfig.json root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/

# SSH and start server
ssh root@5.181.218.15 << 'ENDSSH'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Installing dependencies..."
npm install

echo "Killing any existing processes..."
pkill -f tsx
pkill -f node
sudo fuser -k 8080/tcp

echo "Installing tsx globally..."
npm install -g tsx

echo "Starting server..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts > production.log 2>&1 &

sleep 5

echo "Checking server status..."
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep 8080

echo "Testing server response..."
curl -s http://localhost:8080/api/dashboard | head -c 200
ENDSSH

echo ""
echo "Testing external access..."
sleep 3
curl -s "https://opt.vivaindia.com/api/dashboard" | head -c 100