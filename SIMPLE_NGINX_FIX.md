# Simple Nginx Fix for Domain Access

## Current Status
- ✅ PM2: optistore-main running (3.3mb memory)
- ✅ Application: Working on port 8080
- ✅ Proxy Config: Applied but still 504 error
- ❌ Domain: opt.vivaindia.com still timing out

## Simple Solution - Direct Nginx Server Block

### Step 1: Create Direct Server Configuration
```bash
ssh root@5.181.218.15

# Create direct nginx configuration for subdomain
cat > /etc/nginx/conf.d/opt.vivaindia.com.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;

    # Main application proxy
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
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
}
EOF

# Test nginx configuration
nginx -t

# Reload nginx if test passes
systemctl reload nginx
```

### Step 2: Alternative - Use Different Port
```bash
# If port 80 is blocked by Plesk, use port 8000
cat > /etc/nginx/conf.d/opt-8000.conf << 'EOF'
server {
    listen 8000;
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

nginx -t && systemctl reload nginx
```

### Step 3: Verify and Test
```bash
# Check PM2 is still running
pm2 status

# Test direct application
curl http://localhost:8080/

# Test domain after nginx reload
curl -v http://opt.vivaindia.com/

# If using port 8000
curl -v http://opt.vivaindia.com:8000/

# Check nginx error logs if still failing
tail -f /var/log/nginx/error.log
```

## Expected Access Points
After this fix:
- ✅ **opt.vivaindia.com** - Main application (if port 80 works)
- ✅ **opt.vivaindia.com:8000** - Alternative access (if port 80 blocked)
- ✅ **opt.vivaindia.com:8080** - Direct application access