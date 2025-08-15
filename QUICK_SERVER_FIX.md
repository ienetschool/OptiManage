# QUICK FIX FOR 502 BAD GATEWAY ERROR

## The Problem
Your production server (opt.vivaindia.com) is showing 502 Bad Gateway because the Node.js server is not running.

## Immediate Solution
Run this command to restart your server:

```bash
ssh vivassh@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt
pkill -f 'tsx server/index.ts'
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &
sleep 5
ps aux | grep tsx
curl -s http://localhost:8080/api/dashboard | head -c 100
EOF
```

## What This Does
1. Kills any existing server processes
2. Starts the server with your MySQL database connection
3. Runs in background with proper logging
4. Tests the server response

## Expected Result
- opt.vivaindia.com will load properly
- All pages will work instead of showing 502 error
- Patient registration and forms will work with MySQL

## Alternative: Use Auto-Deploy Script
```bash
./auto-deploy.sh
```
This uploads the MySQL fixes AND restarts the server automatically.

Your MySQL database is ready - just need to get the server running again!