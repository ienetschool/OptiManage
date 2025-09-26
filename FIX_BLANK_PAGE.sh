#!/bin/bash

# Fix Blank Page Issue - OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Checking Current Environment ==="
pm2 show optistore-main | grep -A10 "env:"
echo "NODE_ENV: $(pm2 show optistore-main | grep NODE_ENV || echo 'Not set')"

echo ""
echo "=== Checking Static Files ==="
echo "Contents of server/public/:"
ls -la server/public/ | head -10

echo ""
echo "Contents of dist/:"
ls -la dist/ | head -10

echo ""
echo "=== Setting Production Environment and Rebuilding ==="
# Set NODE_ENV to production for static file serving
pm2 stop optistore-main

# Update environment to production
export NODE_ENV=production
export PORT=8080

# Ensure build files exist and are current
npm run build

# Copy build files to server/public
mkdir -p server/public
cp -r dist/* server/public/

# Restart with production environment
pm2 delete optistore-main 2>/dev/null || true
pm2 start --name "optistore-main" --env production npm -- run dev

echo ""
echo "=== Waiting for restart ==="
sleep 10

echo ""
echo "=== Testing after restart ==="
pm2 status
pm2 logs optistore-main --lines 5

echo ""
echo "Testing localhost:8080:"
curl -I http://localhost:8080/ | head -5

echo ""
echo "Testing HTML content:"
curl -s http://localhost:8080/ | head -20

echo ""
echo "=== Final Fix: Create startup script with correct environment ==="
cat > start-production.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
npm run dev
EOF

chmod +x start-production.sh

# Update PM2 to use the startup script
pm2 delete optistore-main
pm2 start start-production.sh --name "optistore-main"

echo ""
echo "=== Final Test ==="
sleep 10
curl -s http://localhost:8080/ | head -10
echo ""
echo "✅ OptiStore Pro should now load the full interface at opt.vivaindia.com:8080"