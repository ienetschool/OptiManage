# 502 Bad Gateway Troubleshooting

## What 502 Error Means
- Nginx is running (that's why you see the error page)
- But the backend Node.js server on port 8080 is NOT running
- Nginx can't proxy requests to the application

## Solution Steps

### In Your SSH Session:

1. **Check if server is running:**
   ```bash
   ps aux | grep tsx
   ```

2. **If no processes found, start the server:**
   ```bash
   cd /var/www/vhosts/vivaindia.com/opt
   NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' npx tsx server/index.ts &
   ```

3. **Verify server is listening:**
   ```bash
   netstat -tlnp | grep :8080
   ```

4. **Test server response:**
   ```bash
   curl http://localhost:8080/api/dashboard
   ```

## Expected Results
- `ps aux | grep tsx` should show a running process
- `netstat` should show port 8080 listening  
- `curl localhost:8080` should return JSON data
- opt.vivaindia.com should load without 502 error

## MySQL Database
Your database is ready: `mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro`

The issue is just getting the Node.js server running on port 8080.