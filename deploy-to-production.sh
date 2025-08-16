#!/bin/bash

# OptiStore Pro Production Deployment Script
# Target: opt.vivaindia.com (5.181.218.15)

set -e

SERVER="5.181.218.15"
USER="root"
PASSWORD="&8KXC4D+Ojfhuu0LSMhE"
DOMAIN="opt.vivaindia.com"
APP_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.com"

echo "🚀 Starting OptiStore Pro deployment to production..."

# Create production build
echo "📦 Building application for production..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment-package
cp -r dist/* deployment-package/ 2>/dev/null || true
cp -r server deployment-package/
cp -r shared deployment-package/
cp package.json deployment-package/
cp package-lock.json deployment-package/

# Create production environment file
cat > deployment-package/.env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=optistore-pro-secure-session-key-2025
FORCE_PRODUCTION=true
EOF

# Create PM2 ecosystem file
cat > deployment-package/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

echo "🔧 Connecting to production server..."

# Test connection
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" "echo 'Connection successful to production server'"

# Prepare server environment
echo "🛠️ Preparing server environment..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
# Update system
dnf update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Install PM2 and tsx globally
npm install -g pm2 tsx

# Create application directory
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/logs

# Set permissions
chmod 755 /var/www/vhosts/vivaindia.com/opt.vivaindia.com

echo "Server environment prepared successfully"
ENDSSH

# Deploy application files
echo "📤 Uploading application files..."
sshpass -p "$PASSWORD" scp -r -o StrictHostKeyChecking=no deployment-package/* "$USER@$SERVER:$APP_PATH/"

# Install dependencies and start application
echo "⚙️ Installing dependencies and starting application..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << ENDSSH
cd $APP_PATH

# Install dependencies
npm install --production

# Stop existing PM2 processes
pm2 stop all || true
pm2 delete all || true

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Check application status
pm2 status

echo "🎉 Application deployed successfully!"
echo "📊 Application Status:"
pm2 list
echo ""
echo "🌐 Access your application at: https://opt.vivaindia.com"
echo "🔧 Direct access: http://opt.vivaindia.com:5000"
ENDSSH

echo "✅ Deployment completed successfully!"
echo "🌐 Your OptiStore Pro is now live at: https://opt.vivaindia.com"

# Clean up
rm -rf deployment-package