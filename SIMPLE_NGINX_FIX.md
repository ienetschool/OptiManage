# Simple Nginx Fix for Standard Domain Access

## Current Issue
- Production app running on port 80 via PM2
- Plesk showing error page instead of serving the application
- Need to configure Plesk to properly forward requests

## Quick Solution: Use Nginx Configuration

### Step 1: Configure Nginx in Plesk
Go to: Websites & Domains → opt.vivaindia.com → Apache & nginx Settings

**Clear "Additional Apache directives"** and add to **"Additional nginx directives"**:

```nginx
location / {
    proxy_pass http://127.0.0.1:80;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### Step 2: Alternative - Switch to Different Port
If still having conflicts on port 80, switch to port 3000:

```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="3000" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

Then use nginx config:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### Step 3: Test Result
After applying nginx configuration, visit: http://opt.vivaindia.com
Should load OptiStore Pro without port number.

The nginx approach is often more reliable than Apache proxy in Plesk environments.