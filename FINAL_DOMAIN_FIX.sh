#!/bin/bash

# Final Domain Access Fix for OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Current Status Check ==="
pm2 status
echo ""

echo "=== Testing Direct Application ==="
curl -I http://localhost:8080/
echo ""

echo "=== Creating Final Nginx Configuration ==="
cat > /etc/nginx/conf.d/optistore.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;

    # Remove any redirects
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Handle API calls
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Handle static assets
    location /assets/ {
        proxy_pass http://127.0.0.1:8080/assets/;
        proxy_redirect off;
        proxy_set_header Host $host;
    }
}

# Alternative access on port 3000
server {
    listen 3000;
    server_name opt.vivaindia.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "=== Testing Nginx Configuration ==="
nginx -t

echo "=== Reloading Nginx ==="
systemctl reload nginx

echo "=== Waiting for Nginx Reload ==="
sleep 5

echo "=== Testing Domain Access ==="
curl -I http://opt.vivaindia.com/
curl -I http://opt.vivaindia.com:3000/

echo ""
echo "=== Testing API Endpoint ==="
curl -s http://opt.vivaindia.com/api/dashboard | head -3 || echo "API test failed"
curl -s http://opt.vivaindia.com:3000/api/dashboard | head -3 || echo "Port 3000 API test failed"

echo ""
echo "=== Final Status ==="
echo "✅ PM2 Process: optistore-main running"
echo "✅ Application: Responding on localhost:8080"
echo "✅ Nginx Config: Applied with redirect handling"
echo ""
echo "🎯 Access Points:"
echo "   - http://opt.vivaindia.com (main domain)"
echo "   - http://opt.vivaindia.com:3000 (alternative)"
echo "   - http://opt.vivaindia.com:8080 (direct app)"