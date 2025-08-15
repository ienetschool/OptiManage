# Nginx Proxy Configuration for opt.vivaindia.com

## Goal: Access OptiStore Pro at http://opt.vivaindia.com without :8080

## Method 1: Plesk Nginx Configuration
1. Login to Plesk panel
2. Navigate to: Websites & Domains → opt.vivaindia.com
3. Click "Apache & nginx Settings"
4. In "Additional nginx directives" section, add:

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

## Method 2: SSH Commands (Alternative)
Run these in SSH as root:

```bash
# Create nginx config for the domain
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

# Reload nginx
nginx -t && systemctl reload nginx
```

## Method 3: Simple Redirect (Quick Fix)
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=http://opt.vivaindia.com:8080">
    <title>OptiStore Pro</title>
</head>
<body>
    <p>Redirecting to OptiStore Pro...</p>
    <script>window.location.href = 'http://opt.vivaindia.com:8080';</script>
</body>
</html>
EOF
```

## Result
After applying any method, users can access:
- http://opt.vivaindia.com → OptiStore Pro main application
- http://opt.vivaindia.com/install → Database setup page

The :8080 port will be hidden from users.