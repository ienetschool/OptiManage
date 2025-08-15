# Domain Access Fix - Remove Port 8080 Requirement

## Current Issue
- Application requires :8080 in URL
- User wants normal domain access: http://opt.vivaindia.com
- Database connection test failing

## Solution: Plesk Proxy Configuration

### Step 1: Set up Proxy in Plesk
1. Login to Plesk control panel
2. Go to "Websites & Domains" → opt.vivaindia.com
3. Go to "Apache & nginx Settings"
4. Add this to "Additional nginx directives":

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Step 2: Alternative - Use .htaccess redirect
Add to document root .htaccess:
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^opt\.vivaindia\.com$
RewriteRule ^(.*)$ http://opt.vivaindia.com:8080/$1 [R=301,L]
```

### Step 3: Database Connection Fix
The connection test is failing because the production server doesn't have the API endpoints active.

## SSH Commands to Execute:

```bash
# 1. Create nginx proxy config
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com
cat > .htaccess << 'EOF'
RewriteEngine On
RewriteCond %{SERVER_PORT} !^8080$
RewriteRule ^(.*)$ http://opt.vivaindia.com:8080/$1 [R=301,L]
EOF

# 2. Check if server on 8080 has API routes
curl -I http://localhost:8080/api/test-db-connection

# 3. If API missing, ensure production server is running full app
ps aux | grep "server/index.ts"
```