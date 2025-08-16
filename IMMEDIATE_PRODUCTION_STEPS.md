# IMMEDIATE PRODUCTION FIX STEPS

## Current Status
✅ PM2 is running successfully (optistore-production online)
❌ Nginx configuration conflict (duplicate location "/")

## Fix Steps

### 1. Clear Conflicting Configuration
- Go to Plesk → opt.vivaindia.com → Apache & nginx Settings
- **DELETE ALL CONTENT** from "Additional nginx directives"
- Click OK to save

### 2. Add Non-Conflicting Configuration
Add this to "Additional nginx directives":

```
location /app/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Test Access
- Click OK in Plesk
- Wait 30 seconds for nginx reload
- Visit: **https://opt.vivaindia.com/app/**

## Why This Works
- No location "/" conflict
- Uses subdirectory approach
- PM2 keeps server running
- Medical app accessible at /app/ path

Your OptiStore Pro medical practice management system will be fully functional at the new URL.