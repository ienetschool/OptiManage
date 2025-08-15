#!/bin/bash

# SIMPLE PRODUCTION FIX - Start OptiStore Pro without ecosystem.config.js
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== SIMPLE PRODUCTION START ==="

# Kill any existing processes
pm2 delete optistore-main 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Set environment variables
export NODE_ENV=production
export FORCE_PRODUCTION=true
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Start directly without ecosystem.config.js (which was causing the error)
echo "Starting OptiStore Pro directly..."
pm2 start "npm run dev" --name "optistore-main" --env NODE_ENV=production --env FORCE_PRODUCTION=true --env PORT=8080

echo ""
echo "Waiting 10 seconds for startup..."
sleep 10

echo ""
echo "Testing server:"
curl -I http://localhost:8080/ | head -2 || echo "Server not responding yet"

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Checking port 8080:"
netstat -tlnp | grep :8080 || ss -tlnp | grep :8080 || echo "Port 8080 not active"

echo ""
echo "If server is not running, try manual start:"
echo "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "NODE_ENV=production PORT=8080 npm run dev"