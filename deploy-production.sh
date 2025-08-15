#!/bin/bash

# Simple Production Deployment
echo "Deploying to production server..."

ssh vivassh@5.181.218.15 << 'EOF'
# Go to website directory
cd /var/www/vhosts/vivaindia.com/

# Stop any running servers
pkill -f tsx 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Create directories if needed
mkdir -p server shared client

# Start server with MySQL
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > server.log 2>&1 &

# Check if it started
sleep 5
ps aux | grep tsx | grep -v grep
curl -s http://localhost:8080/api/dashboard | head -c 100
EOF

echo "Testing external access..."
curl -s https://opt.vivaindia.com/api/dashboard