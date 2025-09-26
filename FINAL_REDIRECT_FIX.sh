#!/bin/bash

# Final Redirect Fix for OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Checking PM2 Logs for Port Information ==="
pm2 logs optistore-main --lines 10 | grep -E "(serving|port|listen)"

echo ""
echo "=== Checking which port is actually responding ==="
echo "Testing localhost:8080:"
curl -I http://localhost:8080/ 2>/dev/null | head -5

echo ""
echo "Testing localhost:5000:"  
curl -I http://localhost:5000/ 2>/dev/null | head -5

echo ""
echo "=== Removing ALL nginx configs and starting fresh ==="
rm -f /etc/nginx/conf.d/opt*.conf
rm -f /etc/nginx/conf.d/optistore*.conf

echo ""
echo "=== Creating Simple Direct Proxy Configuration ==="
cat > /etc/nginx/conf.d/optistore-simple.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;
    
    # Remove any default redirects
    error_page 301 302 303 307 308 = @proxy;
    
    location @proxy {
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
EOF

echo ""
echo "=== Also disable any Plesk redirects ==="
rm -f /var/www/vhosts/vivaindia.com/conf/vhost_nginx.conf

echo ""
echo "=== Testing and applying nginx configuration ==="
nginx -t
systemctl reload nginx

echo ""
echo "=== Waiting for nginx reload ==="
sleep 10

echo ""
echo "=== Testing final access ==="
echo "Testing main domain:"
curl -v http://opt.vivaindia.com/ 2>&1 | head -15

echo ""
echo "Testing direct port access:"
curl -I http://opt.vivaindia.com:8080/ | head -5

echo ""
echo "=== Final Status Check ==="
pm2 status
echo ""
echo "🎯 If still showing 301, the redirect is coming from the Express app itself."
echo "Try accessing: http://opt.vivaindia.com:8080 directly to bypass nginx."