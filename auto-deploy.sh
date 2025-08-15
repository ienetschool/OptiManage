#!/bin/bash

# Automatic Production Deployment Script
# This script watches for changes and automatically deploys to production

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "🚀 AUTO-DEPLOYMENT TO PRODUCTION SERVER"
echo "========================================"
echo "Target: $PROD_USER@$PROD_HOST:$PROD_PATH"
echo "MySQL: ledbpt_optie@localhost:3306/opticpro"
echo ""

# Function to deploy files
deploy_files() {
    echo "📤 Uploading files to production..."
    
    # Upload server files
    scp -r server/ $PROD_USER@$PROD_HOST:$PROD_PATH/ && echo "✅ Server files uploaded"
    
    # Upload shared files
    scp -r shared/ $PROD_USER@$PROD_HOST:$PROD_PATH/ && echo "✅ Shared files uploaded"
    
    # Upload client files (if changed)
    scp -r client/ $PROD_USER@$PROD_HOST:$PROD_PATH/ && echo "✅ Client files uploaded"
    
    echo ""
}

# Function to restart production server
restart_server() {
    echo "🔄 Restarting production server..."
    
    ssh $PROD_USER@$PROD_HOST << EOF
cd $PROD_PATH

# Stop existing server
echo "Stopping current server..."
pkill -f 'tsx server/index.ts'
sleep 3

# Build client if needed
if [ -d "client" ]; then
    echo "Building client..."
    cd client && npm run build && cd ..
    cp -r client/dist/* server/public/
fi

# Start server with MySQL
echo "Starting server with MySQL..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='$DATABASE_URL' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Checking server status..."
sleep 5
ps aux | grep tsx | grep -v grep

echo "Testing API..."
curl -s http://localhost:8080/api/dashboard | head -c 100
EOF

    echo ""
}

# Function to test deployment
test_deployment() {
    echo "🧪 Testing production deployment..."
    
    # Test API endpoints
    echo "Testing dashboard API..."
    curl -s https://opt.vivaindia.com/api/dashboard > /dev/null && echo "✅ Dashboard API working"
    
    echo "Testing patient registration..."
    curl -s -X POST https://opt.vivaindia.com/api/patients \
        -H "Content-Type: application/json" \
        -d '{"firstName":"AutoDeploy","lastName":"Test","phone":"1234567890","email":"deploy@test.com"}' \
        > /dev/null && echo "✅ Patient registration working"
    
    echo ""
}

# Main deployment process
main() {
    echo "Starting auto-deployment process..."
    
    deploy_files
    restart_server
    test_deployment
    
    echo "✅ AUTO-DEPLOYMENT COMPLETE!"
    echo "🌐 Production server updated: https://opt.vivaindia.com"
    echo "📊 MySQL database: opticpro (ledbpt_optie@localhost:3306)"
    echo ""
    echo "To run again: ./auto-deploy.sh"
}

# Run deployment
main