# Nginx Configuration Fix

## Issue Identified
The nginx configuration shows error: "duplicate location '/'" 
This means Plesk already has a default location block that conflicts.

## Solution: Use Specific Configuration

### Clear the current nginx directives and replace with this corrected version:

```nginx
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
```

**Note:** Remove the "location / {" wrapper since Plesk handles that automatically.

### Alternative: Try Apache Instead
If nginx still has conflicts, clear nginx directives completely and use Apache directives:

```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
```

### Test the Result
After applying the corrected configuration:
- Click OK to apply
- Visit http://opt.vivaindia.com
- Should load OptiStore Pro without errors

The key is removing the location block wrapper and letting Plesk handle the location context automatically.