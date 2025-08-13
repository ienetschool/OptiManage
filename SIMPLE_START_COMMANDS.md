# Simple Production Start Commands

## Issue
The ecosystem.config.js is still showing malformation errors on the server, likely due to file transfer issues.

## Direct Solution - Use Environment Variables

### 1. Stop current process and start with direct environment
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
```

### 2. Start with inline environment variables
```bash
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" \
NODE_ENV="production" \
PORT="5000" \
COMPANY_NAME="OptiStore Pro" \
ADMIN_EMAIL="admin@opt.vivaindia.com" \
DOMAIN="https://opt.vivaindia.com" \
SESSION_SECRET="OptiStore-Pro-2025-Secret" \
pm2 start dist/index.js --name optistore-pro
```

### 3. Check status and logs
```bash
pm2 status
pm2 logs optistore-pro --lines 10
```

### 4. Test application
```bash
curl http://localhost:5000
```

### 5. Save configuration
```bash
pm2 save
```

## Expected Result
- PM2 status shows "online"
- No DATABASE_URL errors
- Application responds to curl
- Website works at https://opt.vivaindia.com

This approach bypasses the ecosystem.config.js file entirely and sets environment variables directly in the PM2 start command.