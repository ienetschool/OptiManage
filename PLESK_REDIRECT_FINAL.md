# Final Plesk Redirect Configuration

## Issue: Port Access Required
Currently OptiStore Pro requires port access: http://opt.vivaindia.com:8080

## Solution: Update Document Root in Plesk

### Step 1: Fix Document Root
In Plesk hosting settings for opt.vivaindia.com:

**Change Document Root from:**
```
opt.vivaindia.com/optistore-app/dist
```

**To:**
```
opt.vivaindia.com/httpdocs
```

### Step 2: Verify Redirect File
Ensure this file exists: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>OptiStore Pro - Loading...</title>
    <meta http-equiv="refresh" content="0; url=http://opt.vivaindia.com:8080/">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin-top: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        a { 
            color: #fff; 
            text-decoration: none;
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: inline-block;
        }
        .loading {
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏥</div>
        <h2>OptiStore Pro</h2>
        <p class="loading">Loading medical practice management system...</p>
        <p>If not redirected automatically, <a href="http://opt.vivaindia.com:8080/">click here</a></p>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = "http://opt.vivaindia.com:8080/";
        }, 1500);
    </script>
</body>
</html>
```

### Step 3: Clear All Plesk Directives
- Clear all Apache directives
- Clear all nginx directives  
- Apply changes

### Step 4: Test
- Visit http://opt.vivaindia.com 
- Should show loading page and redirect to :8080

## Alternative: Nginx Proxy (If Above Doesn't Work)

If document root change doesn't work, add this to nginx directives:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Current Status
✅ MySQL database configured
✅ Application running on port 8080  
🔄 Redirect configuration needed

Once document root is updated in Plesk, users can access OptiStore Pro at http://opt.vivaindia.com without port numbers.