# Nginx Configuration Fix

## Issue Identified
The nginx configuration has a syntax error. Looking at the current config, there's a missing closing brace.

## Fixed Configuration
Replace the current nginx directives with this corrected version:

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
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
    proxy_buffering off;
}
```

## Key Fixes:
1. Added missing closing brace `}`
2. Proper syntax formatting
3. All directives properly terminated with semicolons

## Alternative Simple Configuration:
If the above still causes issues, try this minimal version:

```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

After applying, click OK and test https://opt.vivaindia.com again.