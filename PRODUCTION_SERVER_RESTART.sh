#!/bin/bash

echo "🔧 FIXING PRODUCTION SERVER PORT CONFLICTS"
echo "=========================================="

# SSH into production server and fix the port issue
ssh vivassh@5.181.218.15 << 'EOF'
echo "Stopping all processes on port 8080..."
pkill -f 'tsx server/index.ts' 2>/dev/null || true
pkill -f 'node.*8080' 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true

echo "Waiting for processes to stop..."
sleep 5

echo "Checking if port 8080 is free..."
netstat -tlnp | grep :8080 && echo "Port still in use" || echo "Port 8080 is now free"

echo "Navigating to project directory..."
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Starting production server..."
NODE_ENV=production PORT=8080 DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' tsx server/index.ts > production.log 2>&1 &

echo "Waiting for server to start..."
sleep 10

echo "Checking server status..."
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep :8080

echo "Testing server response..."
curl -s http://localhost:8080/api/dashboard | head -c 100

echo "Server logs:"
tail -10 production.log

echo "✅ Production server restart complete"
EOF

echo "Production server should now be accessible at opt.vivaindia.com"