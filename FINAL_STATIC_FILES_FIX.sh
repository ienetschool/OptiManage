#!/bin/bash

# Final Static Files Fix for OptiStore Pro
# Run this in your SSH terminal

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Check what's in the dist directory
echo "Contents of dist directory:"
ls -la dist/

# Check what's in server/public
echo "Contents of server/public:"
ls -la server/public/

# Copy all files from dist to server/public (force overwrite)
echo "Copying dist files to server/public..."
rm -rf server/public/*
cp -r dist/* server/public/

# Make sure index.html exists in the right place
if [ -f "dist/index.html" ]; then
    cp dist/index.html server/public/index.html
    echo "Copied index.html to server/public/"
fi

# List what's now in server/public
echo "Files now in server/public:"
ls -la server/public/

# Set proper permissions
chmod -R 755 server/public/

# Restart PM2
echo "Restarting PM2..."
pm2 restart optistore-main

# Wait and test
sleep 10

echo "Testing server response..."
curl -I http://localhost:8080/
curl http://localhost:8080/ | head -10

echo "Testing API..."
curl http://localhost:8080/api/dashboard | head -10

echo "PM2 Status:"
pm2 status

echo "Recent PM2 logs:"
pm2 logs optistore-main --lines 10