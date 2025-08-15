#!/bin/bash

# PRODUCTION SERVER START - OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== STARTING OPTISTORE PRO PRODUCTION SERVER ==="

# Check current status
echo "1. Checking if PM2 is running:"
pm2 status | grep optistore || echo "No PM2 process found"

echo ""
echo "2. Checking port 8080:"
netstat -tlnp | grep :8080 || ss -tlnp | grep :8080 || echo "Port 8080 not in use"

echo ""
echo "3. Installing dependencies if needed:"
npm install --production

echo ""
echo "4. Building frontend:"
npm run build

echo ""
echo "5. Setting up static files:"
mkdir -p server/public
cp -r dist/public/* server/public/
ls -la server/public/

echo ""
echo "6. Setting correct permissions:"
chmod -R 755 server/public/
chown -R vivassh:psacln server/public/

echo ""
echo "7. Creating production environment file:"
cat > .env.production << 'EOF'
NODE_ENV=production
FORCE_PRODUCTION=true
PORT=8080
DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro
EOF

echo ""
echo "8. Starting PM2 with production config:"
pm2 delete optistore-main 2>/dev/null || true

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-main',
    script: 'npm',
    args: 'run dev',
    env_file: '.env.production',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

pm2 start ecosystem.config.js

echo ""
echo "9. Waiting for startup..."
sleep 15

echo ""
echo "10. Testing server response:"
curl -I http://localhost:8080/ | head -3

echo ""
echo "11. Testing static assets:"
curl -I http://localhost:8080/assets/index-BwQnpknj.css | head -1

echo ""
echo "12. Testing API endpoints:"
curl -s http://localhost:8080/api/dashboard | head -1

echo ""
echo "13. Final PM2 status:"
pm2 status

echo ""
echo "=== PRODUCTION SERVER STATUS ==="
echo "✅ OptiStore Pro should now be accessible at:"
echo "   http://opt.vivaindia.com:8080"
echo "   http://5.181.218.15:8080"
echo ""
echo "✅ Installation page available at:"
echo "   http://opt.vivaindia.com/install"
echo ""
echo "Server process: $(pm2 status | grep optistore | awk '{print $4}')"
echo "Memory usage: $(pm2 status | grep optistore | awk '{print $7}')"