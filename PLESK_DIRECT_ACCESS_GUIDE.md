# ✅ PLESK Direct Access Configuration Guide

## Your Domain Setup
- **Domain**: opt.vivaindia.com
- **Hosting Type**: Website 
- **Document Root**: /opt.vivaindia.sql
- **SSL**: Enabled with Let's Encrypt
- **Server**: 5.181.218.15 (AlmaLinux 9 + Plesk)

## Step 1: Configure Nginx Reverse Proxy in Plesk

### Method A: Using Plesk Interface
1. Go to **Domains** → **opt.vivaindia.com** → **Apache & nginx Settings**
2. In the **Additional nginx directives** section, add:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_redirect off;
    
    # WebSocket support for real-time features
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Serve static assets directly
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://127.0.0.1:8080;
    proxy_cache_valid 200 1h;
    add_header Cache-Control "public, immutable";
}
```

### Method B: Direct File Configuration (Alternative)
If Method A doesn't work, create/edit the nginx configuration file:

**File**: `/var/www/vhosts/opt.vivaindia.com/conf/vhost_nginx.conf`

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name opt.vivaindia.com;
    
    # SSL configuration (handled by Plesk)
    include /var/www/vhosts/opt.vivaindia.com/conf/vhost_ssl.conf;
    
    # Proxy all requests to Node.js app
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_redirect off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Step 2: Upload and Start Your Application

### Upload Application Files
1. Upload all OptiStore Pro files to: `/var/www/vhosts/opt.vivaindia.com/httpdocs/`
2. Ensure these key files are present:
   - `package.json`
   - `server/` directory
   - `client/` directory  
   - `.env` with MySQL credentials

### Install Dependencies
SSH into your server and run:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
npm install
```

### Configure Environment
Create `.env` file:
```env
DATABASE_URL=mysql://ledbpt_optie:Facebook@123@5.181.218.15:3306/opticpro
NODE_ENV=production
PORT=8080
```

### Start with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 3: Test Configuration

### Reload Nginx
```bash
plesk bin nginx_reload
# OR
systemctl reload nginx
```

### Test Access
1. **Direct access**: https://opt.vivaindia.com (should work without :8080)
2. **Installation**: https://opt.vivaindia.com/install
3. **API test**: https://opt.vivaindia.com/api/stores

## Step 4: Troubleshooting

### Check PM2 Status
```bash
pm2 status
pm2 logs
```

### Check Nginx Configuration
```bash
nginx -t
systemctl status nginx
```

### Check Port 8080
```bash
netstat -tlnp | grep 8080
curl http://localhost:8080/api/stores
```

## Expected Results
- ✅ **https://opt.vivaindia.com** → OptiStore Pro main interface
- ✅ **https://opt.vivaindia.com/install** → Installation interface
- ✅ **https://opt.vivaindia.com/api/stores** → API response
- ✅ **No :8080 in URLs** → Clean professional appearance

## Final Verification
Once configured, your medical practice management system will be accessible at:
**https://opt.vivaindia.com** with full SSL encryption and no port numbers visible to users.