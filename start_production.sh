#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Create logs directory
mkdir -p logs

# Install dependencies if needed
npm install
npm install -g tsx pm2

# Stop any existing processes
pkill -f tsx
pkill -f node
sudo fuser -k 8080/tcp 2>/dev/null

# Start with PM2
pm2 delete optistore-production 2>/dev/null
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u root --hp /root

echo "Production server started with PM2 auto-restart"
pm2 status
