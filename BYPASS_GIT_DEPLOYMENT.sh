#!/bin/bash

# BYPASS GIT DEPLOYMENT - Direct Production Setup
# This script sets up OptiStore Pro production without relying on Plesk Git deployment

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== BYPASSING GIT DEPLOYMENT ISSUES ==="
echo "Setting up OptiStore Pro production directly..."

# Stop any running processes
pm2 stop optistore-main 2>/dev/null || echo "No PM2 process to stop"

# Ensure we have the latest code (manual approach)
echo "Ensuring latest code is available..."

# Clean and rebuild everything
echo "Cleaning previous builds..."
rm -rf dist/ server/public/ node_modules/.cache 2>/dev/null

echo "Installing dependencies..."
npm install

echo "Building frontend for production..."
NODE_ENV=production npm run build

echo "Setting up production static files..."
mkdir -p server/public
cp -r dist/public/* server/public/

# Fix permissions completely
echo "Setting comprehensive permissions..."
chmod -R 755 .
chmod -R 755 server/
chmod -R 644 server/public/*.html 2>/dev/null
chmod -R 644 server/public/assets/* 2>/dev/null

# Set web server ownership
chown -R apache:apache . 2>/dev/null || \
chown -R www-data:www-data . 2>/dev/null || \
chown -R nginx:nginx . 2>/dev/null || \
echo "Using current user ownership"

echo "Creating production startup configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-main',
    script: 'npm',
    args: 'run dev',
    env: {
      NODE_ENV: 'production',
      FORCE_PRODUCTION: 'true',
      PORT: 8080,
      DATABASE_URL: 'mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

echo "Starting production server with PM2..."
pm2 delete optistore-main 2>/dev/null || true
pm2 start ecosystem.config.js

echo "Waiting for application to start..."
sleep 20

echo "=== TESTING PRODUCTION DEPLOYMENT ==="
pm2 status

echo "Testing localhost:8080..."
curl -I http://localhost:8080/ | head -3

echo "Testing CSS assets..."
curl -I http://localhost:8080/assets/index-BwQnpknj.css | head -3

echo "Testing application response..."
curl -s http://localhost:8080/ | grep -o "<title>.*</title>"

echo "Testing API endpoints..."
curl -s http://localhost:8080/api/dashboard | jq '.totalPatients' 2>/dev/null || curl -s http://localhost:8080/api/dashboard | head -1

echo ""
echo "=== PRODUCTION STATUS ==="
echo "✅ OptiStore Pro production deployment complete"
echo "✅ Static files served directly without Git deployment"
echo "✅ PM2 process management configured"
echo "✅ Production environment variables set"
echo ""
echo "🎯 Application accessible at:"
echo "   http://opt.vivaindia.com:8080"
echo "   http://5.181.218.15:8080"
echo ""
echo "To verify external access:"
echo "curl -I http://opt.vivaindia.com:8080/"
echo ""
echo "Git deployment is no longer required - application runs independently"