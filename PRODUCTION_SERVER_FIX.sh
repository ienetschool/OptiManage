#!/bin/bash
echo "PRODUCTION SERVER IMMEDIATE FIX"
echo "=============================="

# Create a comprehensive fix script for the production server
cat > server_fix_commands.txt << 'FIX_EOF'
# Run these commands on production server:

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Check what's causing the server to fail
echo "Checking production logs:"
tail -50 production.log

# Check if tsx is installed
which tsx || echo "TSX not found - need to install"

# Install tsx if missing
npm install -g tsx

# Check server/index.ts exists
ls -la server/index.ts

# Set environment properly
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Kill any existing processes
pkill -f 'node.*server'
pkill -f 'tsx.*server'
sudo fuser -k 8080/tcp

# Start server with verbose output to see errors
echo "Starting server with verbose logging..."
tsx server/index.ts 2>&1 | tee startup.log &

# Wait and check if it started
sleep 10
ps aux | grep tsx
netstat -tlnp | grep 8080

# Test the API
curl -v http://localhost:8080/api/dashboard
FIX_EOF

echo "Created server fix commands"
echo ""
echo "SSH into your server and run these commands:"
echo "ssh root@5.181.218.15"
echo ""
echo "Then copy the commands from server_fix_commands.txt above"