# Fix Connection Refused Error

## Issue Identified
- PM2 status shows no running processes
- curl localhost:5000 returns "Connection refused"
- Application not actually running despite previous commands

## Solution Commands

### 1. Check current PM2 status
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 status
pm2 list
```

### 2. Start application with corrected command
```bash
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" COMPANY_NAME="OptiStore Pro" ADMIN_EMAIL="admin@opt.vivaindia.com" DOMAIN="https://opt.vivaindia.com" SESSION_SECRET="OptiStore-Pro-2025-Secret" pm2 start dist/index.js --name optistore-pro
```

### 3. Verify it's running
```bash
pm2 status
pm2 logs optistore-pro --lines 10
curl http://localhost:5000
```

### 4. Check what's using port 5000
```bash
netstat -tulpn | grep :5000
lsof -i :5000
```

### 5. Alternative: Start on different port if conflict
```bash
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="3000" pm2 start dist/index.js --name optistore-pro
```

The key is ensuring PM2 actually starts and keeps the process running without crashes.