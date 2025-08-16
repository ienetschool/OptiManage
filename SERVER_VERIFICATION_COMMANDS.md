# SERVER VERIFICATION COMMANDS

## Current Status
✅ PM2 shows "online" status with 3.3mb memory
❌ Server not responding to external connections
❌ Still getting 502 errors

## Diagnostic Commands to Run in SSH

### 1. Check if server is actually listening on correct interface
```bash
netstat -tlnp | grep 8080
lsof -i :8080
```

### 2. Test local connectivity
```bash
curl http://localhost:8080/api/dashboard
curl http://127.0.0.1:8080/api/dashboard
curl http://0.0.0.0:8080/api/dashboard
```

### 3. Check server logs for binding information
```bash
pm2 logs optistore-production --lines 20
```

### 4. Verify server is binding to 0.0.0.0 not 127.0.0.1
The server needs to listen on 0.0.0.0:8080 for external access.

### 5. If server is only listening on 127.0.0.1, restart with correct binding
```bash
pm2 restart optistore-production
# or
pm2 delete optistore-production
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 HOST=0.0.0.0 pm2 start "node --loader tsx/esm server/index.ts" --name optistore-production
```

### 6. Test firewall/security settings
```bash
iptables -L | grep 8080
systemctl status firewalld
```

### 7. Alternative: Test with different port
```bash
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=3000 pm2 start "node --loader tsx/esm server/index.ts" --name optistore-test
curl http://localhost:3000/api/dashboard
```

## Expected Success
- netstat shows process listening on 0.0.0.0:8080
- curl localhost:8080 returns JSON data
- PM2 logs show "serving on port 8080"
- External connections work

The PM2 process is stable, just need to ensure proper network binding.