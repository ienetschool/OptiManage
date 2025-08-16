# SERVER RECOVERY STEPS - PM2 NOT RESPONDING

## Issue Identified
Even though PM2 shows "online", the Node.js server is not responding to requests. This suggests:
1. Server process crashed but PM2 hasn't detected it yet
2. Server is listening on wrong interface (127.0.0.1 vs 0.0.0.0)
3. Environment variables not properly set

## IMMEDIATE SSH COMMANDS

Run these commands in your SSH terminal to diagnose and fix:

### 1. Check PM2 Status and Logs
```bash
pm2 status
pm2 logs optistore-production --lines 50
```

### 2. Check if Server is Actually Listening
```bash
netstat -tlnp | grep 8080
ps aux | grep tsx
```

### 3. Restart with Correct Configuration
```bash
pm2 delete optistore-production
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 pm2 start tsx --name optistore-production -- server/index.ts
pm2 save
```

### 4. Test Server Locally
```bash
curl http://localhost:8080/api/dashboard
curl http://127.0.0.1:8080/api/dashboard
```

### 5. If Still Not Working, Start in Foreground
```bash
pm2 delete optistore-production
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 tsx server/index.ts
```

### 6. Alternative: Start with Node Directly
```bash
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 node --loader tsx/esm server/index.ts
```

## Expected Result
After successful restart, you should see:
- "serving on port 8080" message
- netstat shows process listening on 8080
- curl localhost:8080 returns JSON data