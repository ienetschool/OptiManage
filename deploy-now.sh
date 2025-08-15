#!/bin/bash

# Deploy OptiStore Pro to production server NOW
echo "🚀 DEPLOYING OPTISTORE PRO TO PRODUCTION"
echo "========================================"

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.sql"

# Upload all files
echo "📤 Uploading files..."
rsync -avz --exclude=node_modules --exclude=.git --exclude=attached_assets \
  ./ $PROD_USER@$PROD_HOST:$PROD_PATH/

# Connect and setup server
echo "🔧 Setting up production server..."
ssh $PROD_USER@$PROD_HOST << EOF
cd $PROD_PATH

# Kill existing processes
pkill -f tsx 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 3

# Install dependencies
npm install --production

# Build client
cd client && npm run build && cd ..
mkdir -p server/public
cp -r client/dist/* server/public/

# Start server with MySQL
export NODE_ENV=production
export PORT=8080
export FORCE_PRODUCTION=true
export DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro'

nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Server started with PID: \$!"
sleep 10

# Test server
echo "Testing server..."
ps aux | grep tsx | grep -v grep
curl -s http://localhost:8080/api/dashboard | head -c 200
EOF

echo "✅ Deployment complete! Testing external access..."
sleep 5
curl -s https://opt.vivaindia.com/api/dashboard