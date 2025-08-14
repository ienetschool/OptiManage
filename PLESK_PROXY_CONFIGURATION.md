# Plesk Proxy Configuration - Complete Solution

## Current Status
✅ Application running on port 3000 via PM2 (18.8MB memory usage)
✅ Database connected and operational
❌ Plesk proxy not forwarding requests properly

## Complete Solution Steps

### Step 1: Access Plesk Apache & nginx Settings
Navigate to: **Websites & Domains** → **opt.vivaindia.com** → **Apache & nginx Settings**

### Step 2: Configure Proxy Mode
1. **Enable "Proxy mode"** checkbox at the top
2. **Clear both** "Additional Apache directives" and "Additional nginx directives" fields completely

### Step 3: Add Nginx Proxy Configuration
In **"Additional nginx directives"** field, add:

```nginx
location / {
    proxy_pass http://localhost:3000;
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
```

### Step 4: Alternative Apache Configuration
If nginx doesn't work, try Apache in **"Additional Apache directives"**:

```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

### Step 5: Disable Static File Handling
In **"Hosting Settings"** for opt.vivaindia.com:
- **Uncheck** "Smart static files processing"
- Set **Document root** to: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist`

### Step 6: Test Access
Visit: **http://opt.vivaindia.com**
Should now load OptiStore Pro without port number.

### Troubleshooting
If still showing error:
1. Check PM2 status: `pm2 status`
2. Test direct access: `curl http://localhost:3000`
3. Restart nginx: `systemctl restart nginx`
4. Check Plesk error logs

## Expected Result
OptiStore Pro accessible at http://opt.vivaindia.com with full functionality:
- Patient management
- Appointment scheduling  
- Inventory tracking
- Invoice processing
- Prescription management