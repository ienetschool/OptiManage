# PLESK NGINX PROXY FIX

## Problem: Duplicate location "/" block
Plesk already has a main location block, so we can't override it in Additional nginx directives.

## Solution: Use specific location blocks only

Replace the entire nginx configuration with ONLY this:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /assets/ {
    proxy_pass http://127.0.0.1:8080/assets/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ~ ^/((?!install).)*$ {
    try_files $uri @proxy;
}

location @proxy {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This configuration:
1. Routes all /api/ requests to port 8080
2. Routes all /assets/ requests to port 8080  
3. Routes all other requests (except /install) to port 8080
4. Avoids conflicting with existing location / block