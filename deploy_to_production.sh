#!/bin/bash

# OptiStore Pro - Production Deployment Script
# Deploy to opt.vivaindia.com (5.181.218.15)

echo "🚀 OptiStore Pro - Production Deployment"
echo "Target: opt.vivaindia.com (5.181.218.15)"
echo "=========================================="

# Set production paths
PROD_SERVER="root@5.181.218.15"
PROD_PATH="/var/www/vhosts/opt.vivaindia.com/httpdocs"
BACKUP_PATH="/var/www/vhosts/opt.vivaindia.com/backup_$(date +%Y%m%d_%H%M%S)"

echo "📦 Creating backup of current deployment..."
ssh $PROD_SERVER "cp -r $PROD_PATH $BACKUP_PATH"

echo "📁 Uploading updated application files..."

# Upload core application files
scp -r server/ $PROD_SERVER:$PROD_PATH/
scp -r client/ $PROD_SERVER:$PROD_PATH/
scp -r shared/ $PROD_SERVER:$PROD_PATH/
scp package.json $PROD_SERVER:$PROD_PATH/
scp ecosystem.config.js $PROD_SERVER:$PROD_PATH/

# Upload installation and test files
scp install.html $PROD_SERVER:$PROD_PATH/
scp simple_connection_test.html $PROD_SERVER:$PROD_PATH/
scp optistore_pro_mysql_complete.sql $PROD_SERVER:$PROD_PATH/

echo "🔧 Setting up environment variables..."
ssh $PROD_SERVER "cd $PROD_PATH && echo 'DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' > .env"
ssh $PROD_SERVER "cd $PROD_PATH && echo 'NODE_ENV=production' >> .env"
ssh $PROD_SERVER "cd $PROD_PATH && echo 'PORT=8080' >> .env"

echo "📦 Installing dependencies..."
ssh $PROD_SERVER "cd $PROD_PATH && npm install --production"

echo "🔄 Restarting application with PM2..."
ssh $PROD_SERVER "cd $PROD_PATH && pm2 restart all || pm2 start ecosystem.config.js"

echo "✅ Deployment complete!"
echo ""
echo "🔗 Test URLs:"
echo "   Main App: https://opt.vivaindia.com"
echo "   Install:  https://opt.vivaindia.com/install"
echo "   Test:     https://opt.vivaindia.com/test-connection"
echo ""
echo "🔍 Connection test should now work correctly!"