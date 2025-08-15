# Plesk Proxy Configuration - No Port 8080 in URL

## Goal: Access OptiStore Pro at http://opt.vivaindia.com (hide port 8080)

## Method 1: Plesk Control Panel (Recommended)
1. Login to your Plesk control panel
2. Go to "Websites & Domains" → "opt.vivaindia.com"
3. Click "Apache & nginx Settings"
4. In "Additional nginx directives" add:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /install {
    proxy_pass http://127.0.0.1:8080/install;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

5. Click "OK" to apply
6. Wait 30 seconds for nginx to reload

## Method 2: SSH Command (If Plesk method doesn't work)
```bash
# Remove the redirect file
rm /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/index.html

# Create nginx config
cat > /var/www/vhosts/system/opt.vivaindia.com/conf/vhost_nginx.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Test and reload nginx
nginx -t && systemctl reload nginx
```

## Result
- **http://opt.vivaindia.com** → Shows OptiStore Pro (no port visible)
- **http://opt.vivaindia.com/install** → Database setup page
- Port 8080 is completely hidden from users