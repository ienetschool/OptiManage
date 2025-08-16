# PM2 STATUS CHECK COMMANDS

Based on your screenshots, you ran the restart commands but still getting 502 errors.
This means the PM2 process may not have started successfully.

## Run these commands in your SSH terminal to diagnose:

### 1. Check if PM2 process is actually running
```bash
pm2 status
```

### 2. Check the PM2 logs for any startup errors
```bash
pm2 logs optistore-production --lines 50
```

### 3. Check if the server process is listening on port 8080
```bash
netstat -tlnp | grep 8080
ps aux | grep tsx
```

### 4. If no process is listening, start manually to see errors
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 tsx server/index.ts
```

### 5. Check for missing dependencies
```bash
npm install
npm install -g tsx
```

### 6. If manual start shows errors, fix them and then use PM2
```bash
pm2 delete optistore-production
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 pm2 start tsx --name optistore-production -- server/index.ts
pm2 save
```

## Success Indicators
- PM2 status shows "online" and stable
- netstat shows process listening on 8080
- Manual tsx start shows "serving on port 8080"
- curl localhost:8080 returns JSON data

Once these are confirmed, the nginx proxy will work correctly.