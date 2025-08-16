#!/bin/bash

echo "IMMEDIATE PRODUCTION DEPLOYMENT"
echo "==============================="

# Create direct deployment without SSH prompts
echo "Creating direct deployment solution..."

# Create a self-contained deployment script
cat > deploy_to_production.sh << 'EOF'
#!/bin/bash

echo "Uploading files to production server..."

# Use scp to copy files directly
scp -o StrictHostKeyChecking=no -r server/ root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/
scp -o StrictHostKeyChecking=no package.json root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/
scp -o StrictHostKeyChecking=no ecosystem.config.js root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/

echo "Files uploaded. Starting production server..."

# Execute commands on production server
ssh -o StrictHostKeyChecking=no root@5.181.218.15 "
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Kill existing processes
pkill -f tsx
pkill -f node
sudo fuser -k 8080/tcp 2>/dev/null

# Install dependencies
npm install
npm install -g tsx pm2

# Start with PM2
pm2 delete optistore-production 2>/dev/null
pm2 start ecosystem.config.js

# Save configuration
pm2 save
pm2 startup systemd -u root --hp /root

echo 'Production server started!'
pm2 status

# Test server
sleep 3
curl -s http://localhost:8080/api/dashboard | head -c 100
"

echo "Testing external access..."
sleep 5
curl -s http://opt.vivaindia.com/api/dashboard | head -c 100

EOF

chmod +x deploy_to_production.sh

echo "Direct deployment script created: deploy_to_production.sh"
echo "This will deploy and start your production server immediately."