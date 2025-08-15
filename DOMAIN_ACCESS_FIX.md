# Domain Access Fix - Final Steps

## Current Status Analysis
- ✅ **PM2 Process**: optistore-main running successfully on port 8080
- ✅ **Server**: Express serving on port 8080 
- ❌ **opt.vivaindia.com**: Shows Plesk error page
- ❌ **opt.vivaindia.com:8080**: Shows "Not Found" (server responding but wrong route)

## Root Cause
The server is running but either:
1. Serving on wrong path/route
2. Plesk proxy configuration not pointing to correct application
3. Missing static file serving configuration

## Fix Commands

### Step 1: Verify Server is Actually Serving Content
```bash
# SSH to your production server
ssh root@5.181.218.15
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Test server directly on the server
curl http://localhost:8080
curl http://localhost:8080/api/dashboard

# Check what routes are available
pm2 logs optistore-main --lines 30
```

### Step 2: Fix Plesk Domain Configuration
```bash
# Create HTML redirect file for main domain
cat > /var/www/vhosts/vivaindia.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>OptiStore Pro - Redirecting...</title>
    <meta http-equiv="refresh" content="0;url=http://opt.vivaindia.com:8080">
</head>
<body>
    <p>Redirecting to OptiStore Pro...</p>
    <p>If you are not redirected, <a href="http://opt.vivaindia.com:8080">click here</a>.</p>
</body>
</html>
EOF

# Set proper permissions
chmod 644 /var/www/vhosts/vivaindia.com/httpdocs/index.html
```

### Step 3: Configure Plesk Proxy (Alternative Method)
```bash
# Create Plesk subdomain configuration
# This needs to be done through Plesk panel or CLI
plesk bin subdomain -c opt -domain vivaindia.com -www-root /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/public
```

### Step 4: Test Application Routes
```bash
# Test if the main application route works
curl -v http://localhost:8080/
curl -v http://localhost:8080/index.html
curl -v http://localhost:8080/api/auth/user

# Check what files are actually being served
ls -la /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/public/
```

## Expected Results
After these fixes:
- ✅ **opt.vivaindia.com** should redirect to the application
- ✅ **opt.vivaindia.com:8080** should show the full OptiStore Pro interface
- ✅ All API endpoints should be accessible