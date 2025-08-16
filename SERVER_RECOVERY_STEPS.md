# PRODUCTION SERVER RECOVERY

## Current Status: 502 Bad Gateway
This means the Node.js server process is not running on port 8080.

## Recovery Steps

### Step 1: Diagnose the Problem
In your SSH terminal, run:
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
tail -50 production.log
```

### Step 2: Check if anything is running on port 8080
```bash
netstat -tlnp | grep 8080
ps aux | grep tsx
```

### Step 3: Start server in foreground to see errors
```bash
pkill -f tsx
sudo fuser -k 8080/tcp
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 tsx server/index.ts
```

### Common Error Solutions:

**If you see "tsx: command not found":**
```bash
npm install -g tsx
```

**If you see "Cannot find module" errors:**
```bash
npm install
```

**If you see syntax errors in medicalRoutes.ts:**
```bash
# Restore backup
cp server/medicalRoutes.ts.backup server/medicalRoutes.ts
# Then restart server
```

**If you see "EADDRINUSE" port already in use:**
```bash
sudo fuser -k 8080/tcp
# Then try starting again
```

### Step 4: Once server starts successfully
If you see "serving on port 8080" in step 3, press Ctrl+C and run:
```bash
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 tsx server/index.ts > production.log 2>&1 &
```

### Step 5: Test the server
```bash
curl http://localhost:8080/api/dashboard
```

Run Step 3 first and share what error message you see!