#!/bin/bash

echo "NGINX PROXY CONFIGURATION FIX"
echo "============================="

# Create nginx configuration for opt.vivaindia.com
cat > nginx_optistore.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
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
}

server {
    listen 443 ssl;
    server_name opt.vivaindia.com;
    
    # SSL configuration (if certificates exist)
    # ssl_certificate /path/to/certificate;
    # ssl_certificate_key /path/to/private/key;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
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
}
EOF

echo "Nginx configuration created: nginx_optistore.conf"
echo ""
echo "DEPLOYMENT INSTRUCTIONS:"
echo "======================="
echo "1. Copy nginx_optistore.conf to your server"
echo "2. SSH: ssh root@5.181.218.15"
echo "3. Copy config: cp nginx_optistore.conf /etc/nginx/sites-available/opt.vivaindia.com"
echo "4. Enable site: ln -sf /etc/nginx/sites-available/opt.vivaindia.com /etc/nginx/sites-enabled/"
echo "5. Test config: nginx -t"
echo "6. Reload nginx: systemctl reload nginx"
echo ""
echo "ALTERNATIVE: Check Plesk nginx configuration"
echo "Go to Plesk > Domains > opt.vivaindia.com > Apache & nginx Settings"
echo "Add this to nginx directives:"
echo ""
echo "location / {"
echo "    proxy_pass http://127.0.0.1:8080;"
echo "    proxy_set_header Host \$host;"
echo "    proxy_set_header X-Real-IP \$remote_addr;"
echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "}"