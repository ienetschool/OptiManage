#!/bin/bash

# Correct Port Fix for OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Checking which port the application is actually running on ==="
pm2 logs optistore-main --lines 5 | grep "serving on port"

echo ""
echo "=== Testing both possible ports ==="
echo "Testing port 5000:"
curl -I http://localhost:5000/ 2>/dev/null | head -3 || echo "Port 5000 not responding"

echo ""
echo "Testing port 8080:"
curl -I http://localhost:8080/ 2>/dev/null | head -3 || echo "Port 8080 not responding"

echo ""
echo "=== Checking PM2 environment variables ==="
pm2 show optistore-main | grep -A5 -B5 "env:"

echo ""
echo "=== Creating Nginx Config for Both Ports ==="
cat > /etc/nginx/conf.d/optistore-final.conf << 'EOF'
# Try port 8080 first (production setting)
upstream optistore_backend {
    server 127.0.0.1:8080;
    server 127.0.0.1:5000 backup;
}

server {
    listen 80;
    server_name opt.vivaindia.com;

    location / {
        proxy_pass http://optistore_backend;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_next_upstream error timeout;
    }
    
    # API routes
    location /api/ {
        proxy_pass http://optistore_backend;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets
    location /assets/ {
        proxy_pass http://optistore_backend;
        proxy_redirect off;
        proxy_set_header Host $host;
    }
}

# Alternative access on port 3000
server {
    listen 3000;
    server_name opt.vivaindia.com;

    location / {
        proxy_pass http://optistore_backend;
        proxy_redirect off;
        proxy_set_header Host $host;
    }
}
EOF

echo ""
echo "=== Opening port 3000 in firewall ==="
firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || echo "Firewall command not available"
firewall-cmd --reload 2>/dev/null || echo "Firewall reload not available"

echo ""
echo "=== Testing and applying nginx configuration ==="
nginx -t
systemctl reload nginx

echo ""
echo "=== Waiting for nginx reload ==="
sleep 5

echo ""
echo "=== Final Testing ==="
echo "Testing main domain:"
curl -I http://opt.vivaindia.com/ | head -3

echo ""
echo "Testing port 3000:"
curl -I http://opt.vivaindia.com:3000/ | head -3

echo ""
echo "Testing API:"
curl -s http://opt.vivaindia.com/api/dashboard | head -3 2>/dev/null || echo "API not responding yet"

echo ""
echo "=== Access Points Ready ==="
echo "✅ http://opt.vivaindia.com"
echo "✅ http://opt.vivaindia.com:3000"
echo "✅ http://opt.vivaindia.com:8080 (direct)"