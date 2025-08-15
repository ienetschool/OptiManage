# PRODUCTION ACCESS ISSUE ANALYSIS

## Problem Identified
✅ **Domain Configuration Working**: opt.vivaindia.com resolves correctly
✅ **HTTPS Working**: /install page serves correctly on HTTPS (HTTP/2 200)
❌ **Route Configuration**: Missing proxy configuration for main app and API routes

## Current Status
- HTTP automatically redirects to HTTPS (301 Moved Permanently)
- HTTPS /install page works (25556 bytes, nginx served)
- Other routes (/, /api/*) not properly proxied to port 8080
- Production server needs to be accessible via HTTPS proxy

## Solution Required
1. Configure HTTPS proxy in Plesk to route to localhost:8080
2. Ensure production server runs on port 8080 with proper SSL handling
3. Update nginx directives for HTTPS rather than HTTP proxy

## Commands to Execute in Production SSH:

```bash
# 1. Start production server on port 8080
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f "tsx.*server/index.ts" 2>/dev/null || true

NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" nohup npx tsx server/index.ts > https-production.log 2>&1 &

# 2. Verify port 8080 is listening
sleep 10
curl -I http://localhost:8080/
curl -I http://localhost:8080/api/dashboard
netstat -tlnp | grep :8080
```

## Plesk HTTPS Configuration
Replace nginx directives with HTTPS-aware configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Port 443;
    proxy_buffering off;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Port 443;
}
```

## Expected Result
- https://opt.vivaindia.com → OptiStore Pro main application
- https://opt.vivaindia.com/install → Database setup (working)
- https://opt.vivaindia.com/api/dashboard → API endpoints