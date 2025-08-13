# Fix Plesk Proxy Configuration

## Current Issue
- Application is running on port 5000 (confirmed)
- Domain shows Plesk error page instead of your app
- Proxy configuration needs adjustment

## Solution Steps

### 1. Check if app is responding locally
SSH to your server and test:
```bash
curl http://localhost:5000
```
This should return HTML from your app.

### 2. Fix Plesk Proxy Configuration

**Option A: Apache & Nginx Settings**
1. Go to Plesk → opt.vivaindia.com → Apache & Nginx Settings
2. In "Additional nginx directives" add:
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
3. Click "Apply"

**Option B: Use Plesk Node.js App Feature**
1. Go to Plesk → opt.vivaindia.com → Node.js
2. Enable Node.js application
3. Set:
   - Application root: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`
   - Application startup file: `dist/index.js`
   - Application URL: leave empty (will use main domain)
4. Click "Enable"

### 3. Alternative: Direct Port Test
Test if your app works by visiting:
```
http://opt.vivaindia.com:5000
```
(Note: HTTP not HTTPS, and with :5000 port)

### 4. Check PM2 Logs
```bash
pm2 logs optistore-pro --lines 50
```
Look for any errors when requests come in.

### 5. Restart Services
```bash
pm2 restart optistore-pro
service nginx reload
```

## Expected Result
After fixing the proxy, visiting https://opt.vivaindia.com should show your OptiStore Pro login page instead of the Plesk error.