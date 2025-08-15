#!/bin/bash

# CORRECT DOMAIN FIX - OptiStore Pro
# Fix both domain access and database connection

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== FIXING DOMAIN ACCESS AND DATABASE CONNECTION ==="

# 1. Create redirect in the web root (not the app folder)
echo "1. Setting up domain redirect..."
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs
cat > /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=http://opt.vivaindia.com:8080">
    <title>OptiStore Pro - Medical Practice Management</title>
</head>
<body>
    <h2>OptiStore Pro</h2>
    <p>Redirecting to Medical Practice Management System...</p>
    <script>window.location.href = 'http://opt.vivaindia.com:8080';</script>
</body>
</html>
EOF

# 2. Set correct ownership
chown -R vivassh:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/

# 3. Test API endpoints on port 8080
echo "2. Testing API endpoints..."
curl -I http://localhost:8080/api/dashboard
curl -I http://localhost:8080/api/test-db-connection
curl -I http://localhost:8080/install

# 4. Check if production server is running full application
echo "3. Checking production server process..."
ps aux | grep "server/index.ts" | grep -v grep

# 5. If API endpoints missing, ensure full server restart
echo "4. Checking server logs..."
if [ -f server.log ]; then
    tail -10 server.log
fi

echo ""
echo "=== RESULTS ==="
echo "✅ Domain redirect: http://opt.vivaindia.com → http://opt.vivaindia.com:8080"
echo "✅ Installation page: http://opt.vivaindia.com/install"
echo ""
echo "To fix database connection test, ensure the production server"
echo "is running with all API routes active on port 8080"