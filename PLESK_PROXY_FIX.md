# Plesk Proxy Configuration for OptiStore Pro

## Current Status: ✅ Application Ready
- Application running on localhost:5000
- PM2 configured for auto-restart
- System startup integration complete
- HTML content serving correctly

## Plesk Proxy Setup Instructions

### Method 1: Plesk Control Panel (Recommended)
1. Login to your Plesk control panel
2. Navigate to **Websites & Domains**
3. Click on **opt.vivaindia.com**
4. Go to **Proxy Rules** (or **Apache & nginx Settings**)
5. Add new proxy rule:
   - **Source**: `/` (root path)
   - **Destination**: `http://localhost:5000`
   - **Enable**: Check all boxes (proxy headers, etc.)

### Method 2: Manual Nginx Configuration
If Plesk proxy doesn't work, edit nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name opt.vivaindia.com;
    
    # SSL configuration (managed by Plesk)
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Test After Configuration
```bash
curl -I https://opt.vivaindia.com
```

Expected result: Should show HTTP 200 and HTML content from OptiStore Pro.

## Final Testing Commands
```bash
# Test local application
curl http://localhost:5000

# Test after proxy setup
curl https://opt.vivaindia.com

# Check PM2 status
pm2 status
```

## Production Checklist ✅
- [x] Application built and optimized
- [x] Database connected successfully  
- [x] PM2 process manager configured
- [x] System startup integration enabled
- [x] Application responding on localhost:5000
- [ ] Plesk proxy configured (final step)
- [ ] HTTPS domain access verified

**OptiStore Pro is ready for production use!**