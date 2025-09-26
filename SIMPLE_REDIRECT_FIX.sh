#!/bin/bash

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# 1. Create redirect in correct web root
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
cat > /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=http://opt.vivaindia.com:8080">
    <title>OptiStore Pro</title>
</head>
<body>
    <h2>OptiStore Pro</h2>
    <p>Redirecting to Medical Practice Management System...</p>
    <script>window.location.href = 'http://opt.vivaindia.com:8080';</script>
</body>
</html>
EOF

# 2. Set correct ownership
chown -R vivassh:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/

# 3. Test if API works on port 8080
curl -I http://localhost:8080/api/test-db-connection
curl -I http://localhost:8080/api/dashboard