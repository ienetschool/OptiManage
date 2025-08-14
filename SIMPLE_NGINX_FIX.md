# Simple Nginx Configuration Fix

## Issue: Duplicate Location Block
The error shows "duplicate location '/'" which means there's already a location block configured elsewhere.

## Solution: Clear and Use Simple Configuration

### Step 1: Clear the Additional nginx directives box completely

### Step 2: Add only this minimal configuration:
```nginx
proxy_pass http://127.0.0.1:5000;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
```

### Alternative: Use Apache Instead
If nginx continues to have conflicts, try using Apache directives instead:

1. Clear the nginx directives completely
2. Go to "Additional Apache directives" section
3. Add:
```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/
```

The issue is that Plesk may already have a default location block, so we need to either:
1. Use directives without the location wrapper, OR
2. Switch to Apache configuration instead