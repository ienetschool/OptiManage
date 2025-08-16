# PRODUCTION SERVER DIAGNOSTIC

## Current Issue Analysis
- Back to 502 Bad Gateway errors
- This suggests PM2 process may have stopped or crashed
- Need to verify server status and restart if necessary

## SSH Diagnostic Commands

### 1. Check PM2 Status
```bash
ssh root@5.181.218.15
pm2 status
pm2 logs optistore-production --lines 30
```

### 2. Check if Server Process is Running
```bash
netstat -tlnp | grep 8080
ps aux | grep tsx | grep -v grep
```

### 3. Check Server Startup Logs
```bash
pm2 logs optistore-production --lines 50
```

### 4. Force Restart Production Server
```bash
pm2 restart optistore-production
```

### 5. If PM2 Process Missing, Recreate
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pm2 delete optistore-production
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 pm2 start tsx --name optistore-production -- server/index.ts
pm2 save
```

### 6. Test Server Response
```bash
curl http://localhost:8080/api/dashboard
curl http://127.0.0.1:8080/api/dashboard
```

### 7. Verify Port Listening
```bash
netstat -tlnp | grep 8080
lsof -i :8080
```

## Expected Working Output
When properly running, you should see:
- PM2 status shows "online"
- netstat shows process listening on port 8080
- curl localhost:8080 returns JSON data
- PM2 logs show "serving on port 8080"

## Once Server is Confirmed Running
Then update nginx configuration in Plesk with simple proxy to port 8080.