# Plesk Proxy Configuration Fix

## Current Status Analysis
- ✅ **opt.vivaindia.com/install** - Working (OptiStore Pro installation interface visible)
- ❌ **opt.vivaindia.com** - 504 Gateway Timeout (Nginx proxy configuration issue)
- ✅ **opt.vivaindia.com:8080** - Application running on direct port access

## Root Cause
The Plesk proxy configuration is not properly forwarding requests from port 80 to port 8080 where the application runs.

## Immediate Fix Commands

### Step 1: Configure Plesk Proxy Pass
```bash
# SSH to your server
ssh root@5.181.218.15

# Navigate to Plesk configuration
cd /var/www/vhosts/vivaindia.com/conf

# Create or edit the vhost_nginx.conf file
cat > vhost_nginx.conf << 'EOF'
# Proxy configuration for OptiStore Pro
location / {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Handle static assets
location /assets/ {
    proxy_pass http://localhost:8080/assets/;
    proxy_set_header Host $host;
}

# Handle API routes
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
EOF

# Rebuild Plesk configuration
/usr/local/psa/admin/bin/httpdmng --reconfigure-domain vivaindia.com
```

### Step 2: Alternative - Direct Nginx Configuration
```bash
# If Plesk method doesn't work, directly edit nginx config
cat > /etc/nginx/plesk.conf.d/server.conf << 'EOF'
server {
    listen 80;
    server_name opt.vivaindia.com;
    
    location / {
        proxy_pass http://localhost:8080;
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

### Step 3: Verify Application Status
```bash
# Ensure PM2 is still running
pm2 status
pm2 logs optistore-main --lines 10

# Test direct access
curl http://localhost:8080/
curl http://localhost:8080/api/dashboard

# Test after proxy configuration
curl http://opt.vivaindia.com/
curl http://opt.vivaindia.com/api/dashboard
```

## Expected Results
After applying these fixes:
- ✅ **opt.vivaindia.com** should load the full OptiStore Pro interface
- ✅ **opt.vivaindia.com:8080** will continue working as backup
- ✅ All API endpoints accessible through main domain