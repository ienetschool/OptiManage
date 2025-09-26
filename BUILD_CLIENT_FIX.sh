#!/bin/bash

# Fix Client Build Issue
# Run these commands in SSH terminal

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop the current process
pm2 stop optistore-main

# Build the client application
echo "Building client application..."
npm run build

# Create the missing public directory if needed
mkdir -p server/public

# Restart the application
pm2 restart optistore-main

# Wait and check logs
sleep 10
pm2 logs optistore-main --lines 20

# Test if server is listening on port 8080
netstat -tlnp | grep :8080

# Test the application
curl -I http://localhost:8080