# PM2 PROCESS CRASH DIAGNOSIS

## Issue Analysis from Screenshots
✅ PM2 process created successfully
✅ Startup configuration saved  
❌ Process shows "errored" status
❌ curl shows "Connection refused" 
❌ Still getting 502 errors

## Root Cause
The PM2 process starts but immediately crashes. This is likely due to:
1. Missing dependencies in production environment
2. File permissions issue
3. Environment variable problems
4. TypeScript compilation issues

## Immediate SSH Commands to Fix

### 1. Check PM2 logs for crash details
```bash
pm2 logs optistore-production --lines 50
```

### 2. Check current PM2 status
```bash
pm2 status
```

### 3. Restart with verbose logging
```bash
pm2 restart optistore-production
pm2 logs optistore-production --lines 20
```

### 4. If process keeps crashing, try with node directly
```bash
pm2 delete optistore-production
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
npm install
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 node --loader tsx/esm server/index.ts
```

### 5. Alternative: Start with explicit tsx installation
```bash
npm install -g tsx@latest
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 pm2 start "tsx server/index.ts" --name optistore-production
```

### 6. Check file permissions
```bash
chown -R vivassh:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
chmod -R 755 /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
```

## Success Verification
- PM2 status shows "online" and stays stable
- curl localhost:8080 returns JSON data
- No error messages in PM2 logs
- Process doesn't restart repeatedly