# Apache Proxy Solution for Standard Domain Access

## Goal: Access OptiStore Pro at http://opt.vivaindia.com (without port)

## Current Status
- Application running on port 8080 via PM2
- Need Plesk proxy to forward standard domain to localhost:8080

## Step-by-Step Solution

### 1. In Plesk Panel - Clear All Previous Configurations
- Go to: Websites & Domains > opt.vivaindia.com > Apache & nginx Settings
- Clear "Additional nginx directives" completely (leave empty)
- Clear "Additional Apache directives" completely (leave empty)
- Apply/Save

### 2. Add Simple Apache Proxy Configuration
In "Additional Apache directives" section, add ONLY this:

```apache
ProxyRequests Off
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:8080/
ProxyPassReverse / http://127.0.0.1:8080/
```

### 3. Alternative: Switch to Port 80
If proxy still doesn't work, run app directly on port 80:

```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="80" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

### 4. Test Result
After configuration, test: http://opt.vivaindia.com
Should load OptiStore Pro without port number.

The key is using the simplest possible Apache proxy configuration.