# Restart OptiStore Pro Application

## Issue Identified
PM2 status shows "optistore-pro" is **stopped** - that's why you're getting 500 errors.

## Fix Commands

### 1. Check why it stopped
```bash
pm2 logs optistore-pro --lines 50
```

### 2. Restart the application
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 restart optistore-pro
```

### 3. If restart fails, start fresh
```bash
pm2 delete optistore-pro
pm2 start dist/index.js --name optistore-pro --env production
```

### 4. Check status and logs
```bash
pm2 status
pm2 logs optistore-pro --lines 20
```

### 5. Test application
```bash
curl http://localhost:5000
```

### 6. Make PM2 auto-restart on failure
```bash
pm2 start dist/index.js --name optistore-pro --env production --max-restarts 5
pm2 save
```

## Expected Result
- PM2 status should show "online" 
- curl localhost:5000 should return HTML
- https://opt.vivaindia.com should work

## If Still Problems
Check for:
- Database connection issues
- Port conflicts
- File permission problems
- Memory issues causing crashes