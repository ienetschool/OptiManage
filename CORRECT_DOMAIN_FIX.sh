#!/bin/bash

echo "PRODUCTION DOMAIN ACCESS FIX"
echo "============================"

# Create alternative nginx configuration that should work
cat > plesk_nginx_fix.conf << 'EOF'
# WORKING NGINX CONFIGURATION FOR PLESK

# Option 1: Proxy all requests to Node.js
location /opti/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}

# Option 2: API-specific routing
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

echo "Alternative nginx configurations created."
echo ""
echo "TROUBLESHOOTING STEPS:"
echo "====================="
echo ""
echo "1. SSH into server:"
echo "   ssh root@5.181.218.15"
echo ""
echo "2. Check if PM2 is really working:"
echo "   pm2 status"
echo "   pm2 logs optistore-production"
echo ""
echo "3. Test server directly:"
echo "   curl http://localhost:8080/api/dashboard"
echo ""
echo "4. If not responding, restart PM2:"
echo "   pm2 restart optistore-production"
echo ""
echo "5. Check server listening:"
echo "   netstat -tlnp | grep 8080"
echo ""
echo "6. If still not working, try direct start:"
echo "   pm2 delete optistore-production"
echo "   DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro' PORT=8080 tsx server/index.ts &"
echo ""
echo "The issue is likely that PM2 shows 'online' but the actual Node.js process is not responding."