#!/bin/bash

# OptiStore Pro - Production Deployment Script
# This script deploys the application to the production server

set -e

echo "🚀 Starting OptiStore Pro deployment..."

# Configuration
PRODUCTION_HOST="5.181.218.15"
PRODUCTION_USER="root"
PRODUCTION_PATH="/var/www/vhosts/system/opt.vivaindia.com/httpdocs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Building application...${NC}"
npm run build 2>/dev/null || echo "No build script found, continuing..."

echo -e "${YELLOW}📤 Uploading files to production server...${NC}"

# Create deployment archive
tar -czf deployment.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.env \
  --exclude=dist \
  --exclude=build \
  --exclude="*.log" \
  .

# Upload to production server
sshpass -p '&8KXC4D+Ojfhuu0LSMhE' scp deployment.tar.gz root@5.181.218.15:/tmp/

# Deploy on production server
sshpass -p '&8KXC4D+Ojfhuu0LSMhE' ssh -o StrictHostKeyChecking=no root@5.181.218.15 "
  echo '🔧 Deploying on production server...'
  
  # Find correct production path
  if [ -d '/var/www/vhosts/system/opt.vivaindia.com/httpdocs' ]; then
    PROD_PATH='/var/www/vhosts/system/opt.vivaindia.com/httpdocs'
  elif [ -d '/var/www/vhosts/vivaindia.com/opt.vivaindia.com' ]; then
    PROD_PATH='/var/www/vhosts/vivaindia.com/opt.vivaindia.com'  
  else
    PROD_PATH='/var/www/vhosts/vivaindia.com/opt.vivaindia.sql'
  fi
  
  echo \"Using production path: \$PROD_PATH\"
  
  # Backup existing files
  if [ -d \"\$PROD_PATH\" ]; then
    cp -r \$PROD_PATH \${PROD_PATH}_backup_\$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'Backup creation skipped'
  fi
  
  # Create directory if it doesn't exist
  mkdir -p \$PROD_PATH
  
  # Extract new files
  cd \$PROD_PATH
  tar -xzf /tmp/deployment.tar.gz
  
  # Set correct permissions
  chown -R vivassh:psacln . 2>/dev/null || echo 'Permission change skipped'
  chmod -R 755 .
  
  # Install dependencies
  npm install --production || echo 'npm install failed, continuing...'
  
  # Stop existing PM2 process
  pm2 delete optistore-production 2>/dev/null || echo 'No existing PM2 process'
  
  # Set environment variables and start application
  export DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro'
  export PORT=8080
  export NODE_ENV=production
  
  # Start PM2 process
  pm2 start 'node --import tsx/esm server/index.ts' --name optistore-production
  pm2 save
  
  # Wait for startup
  sleep 5
  
  # Verify deployment
  echo '✅ Checking deployment status...'
  pm2 status | grep optistore-production || echo 'PM2 process not found'
  curl -f http://localhost:8080/api/dashboard > /dev/null && echo '✅ API responding' || echo '❌ API not responding'
  
  # Cleanup
  rm -f /tmp/deployment.tar.gz
  
  echo '🎉 Deployment completed!'
"

# Cleanup local files
rm -f deployment.tar.gz

echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo -e "${YELLOW}📝 Production URLs:${NC}"
echo -e "   🌐 Application: https://opt.vivaindia.com"
echo -e "   🔧 Direct Port: http://opt.vivaindia.com:8080"
echo -e "   🔌 API: https://opt.vivaindia.com/api/dashboard"