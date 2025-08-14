# Plesk Proxy Configuration - Step by Step

## Current Location: Apache & nginx Settings ✅
You're in the right place! Now add the proxy configuration.

## Step 1: Add Apache Directives
In the "Additional Apache directives" text box (the red area you see), add:

```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://localhost:5000/
ProxyPassReverse / http://localhost:5000/

# Optional: Add headers for better proxy handling
ProxyPassReverse / http://localhost:5000/
Header always set X-Forwarded-Proto "https"
Header always set X-Forwarded-Port "443"
```

## Step 2: Alternative Nginx Method
If Apache proxy doesn't work, scroll down to find "Additional nginx directives" and add:

```nginx
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
```

## Step 3: Apply Changes
1. Click "OK" or "Apply" button
2. Wait for Plesk to reload the configuration

## Step 4: Test the Setup
After applying, test in terminal:
```bash
curl -I https://opt.vivaindia.com
```

Expected result: Should return HTTP 200 and serve your OptiStore Pro application.

## If It Doesn't Work
Try these troubleshooting steps:
1. Check if mod_proxy is enabled in Apache
2. Verify port 5000 is accessible locally
3. Check Plesk error logs

**Start with the Apache directives method first - it's usually the most reliable in Plesk.**