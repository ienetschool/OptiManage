# PRODUCTION SERVER DEBUG - 502 Bad Gateway Fix

## Current Status
- 502 Bad Gateway = Server not running
- File deployment completed successfully
- Need to check server startup errors

## DEBUG STEPS (Run these in your SSH terminal)

### 1. Check if server is running:
```bash
ps aux | grep tsx
ps aux | grep node
netstat -tlnp | grep 8080
```

### 2. Check server logs for errors:
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
tail -50 production.log
```

### 3. Try starting server in foreground to see errors:
```bash
pkill -f tsx
sudo fuser -k 8080/tcp
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts
```

### 4. Common fixes if server won't start:

#### A. If tsx command not found:
```bash
npm install -g tsx
```

#### B. If permission issues:
```bash
chown -R vivassh:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
```

#### C. If syntax error in medicalRoutes.ts:
```bash
# Check syntax
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
tsx --check server/medicalRoutes.ts
```

### 5. After fixing errors, restart in background:
```bash
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts > production.log 2>&1 &
```

### 6. Verify server is working:
```bash
ps aux | grep tsx
curl http://localhost:8080/api/dashboard
```

## EXPECTED OUTPUT
- Server should start without errors
- Dashboard API should return JSON data
- UPDATE endpoints should work: `curl -X PUT http://localhost:8080/api/patients/test`

Run these commands and let me know what errors you see!