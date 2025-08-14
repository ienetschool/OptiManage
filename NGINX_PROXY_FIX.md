# Fix Nginx Proxy Configuration

## Issue Identified
- curl shows HTTP 200 (proxy working at protocol level)
- Browser shows Plesk error page (nginx configuration issue)
- Need to update nginx directives in Plesk

## Solution: Update Nginx Configuration

### 1. Go back to Plesk nginx Settings
Navigate to: Websites & Domains > opt.vivaindia.com > Apache & nginx Settings

### 2. In "Additional nginx directives" section, replace with:
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
    proxy_buffering off;
}
```

### 3. Alternative: Try Apache Configuration
If nginx doesn't work, in "Additional Apache directives", use:
```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/
ProxyPassReverse / https://opt.vivaindia.com/
```

### 4. Verify Application Status
```bash
pm2 status
curl http://localhost:5000
netstat -tlnp | grep :5000
```

The key changes:
- Use 127.0.0.1 instead of localhost
- Add proper headers for HTTPS
- Disable proxy buffering
- Set proxy_redirect off