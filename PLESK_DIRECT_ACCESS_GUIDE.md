# 🌐 Direct Access Setup (No Port Redirects)

## Goal
Access OptiStore Pro at `http://opt.vivaindia.com` directly without any `:8080` port numbers or redirects.

## Current Status
- Application runs on port 8080 internally
- Domain currently redirects or requires port specification
- Need to configure Plesk to serve app directly on port 80

## Solution Options

### Option 1: Nginx Reverse Proxy (Recommended)
Configure Plesk to proxy requests from port 80 to your application on port 8080.

#### Plesk Configuration Steps:
1. **Login to Plesk Control Panel**
2. **Go to Domains > opt.vivaindia.com**
3. **Navigate to Apache & nginx Settings**
4. **Enable nginx for this domain**
5. **Add this nginx directive:**

```nginx
location / {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

6. **Apply Settings**

### Option 2: Change Application Port
Modify the application to run directly on port 80 (requires root privileges).

#### Server Configuration:
```bash
# Stop current application
pm2 stop optistore-pro

# Update application to run on port 80
export PORT=80

# Start with root privileges (required for port 80)
sudo pm2 start npm --name "optistore-pro" -- run start:prod
```

### Option 3: Document Root Method
Change Plesk document root to serve a redirect HTML file.

#### Plesk Steps:
1. **Go to Hosting Settings**
2. **Change Document Root to:** `opt.vivaindia.com/httpdocs`
3. **Create index.html in httpdocs:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=http://localhost:8080">
    <script>window.location.href = 'http://localhost:8080';</script>
</head>
<body>Redirecting to OptiStore Pro...</body>
</html>
```

## Recommended Implementation

**Use Option 1 (Nginx Reverse Proxy)** because:
- ✅ Clean URLs without port numbers
- ✅ No application code changes needed
- ✅ Professional setup
- ✅ Easy to maintain
- ✅ Works with SSL/HTTPS later

## Testing Access
After configuration, test these URLs:
- ✅ `http://opt.vivaindia.com` (should work directly)
- ✅ `https://opt.vivaindia.com` (if SSL configured)

## Current Application Status
- **Running on:** Port 8080
- **MySQL Database:** Connected (5.181.218.15:3306)
- **Installation Interface:** Available at `/install`
- **Status:** Ready for direct access configuration

## Next Steps
1. Choose configuration method (recommend Option 1)
2. Apply Plesk nginx proxy settings
3. Test direct access without port numbers
4. Configure SSL certificate for HTTPS (optional)

Your OptiStore Pro medical practice management system will then be accessible directly at your domain without any port specifications.