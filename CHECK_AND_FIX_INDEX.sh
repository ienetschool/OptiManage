#!/bin/bash

# Check and Fix Index File Issue
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Checking build output ==="
ls -la dist/

echo "=== Checking what Vite actually built ==="
find dist/ -name "*.html" -o -name "index.*"

echo "=== Creating index.html if missing ==="
if [ ! -f "dist/index.html" ]; then
    echo "Creating index.html..."
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OptiStore Pro - Medical Practice Management</title>
    <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
</body>
</html>
EOF
fi

echo "=== Copying all files to server/public ==="
mkdir -p server/public
cp -r dist/* server/public/ 2>/dev/null || echo "Some files may not exist"

echo "=== Checking server/public contents ==="
ls -la server/public/

echo "=== Restarting PM2 ==="
pm2 restart optistore-main

sleep 10

echo "=== Testing server ==="
curl -I http://localhost:8080/
echo ""
curl http://localhost:8080/ | head -5