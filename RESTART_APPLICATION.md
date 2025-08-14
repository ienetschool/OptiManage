# 🔄 Quick Application Restart Guide

If your application at https://opt.vivaindia.com is not responding or showing errors, follow these steps:

## SSH Commands (Copy & Paste):

### 1. Connect:
```bash
ssh root@5.181.218.15
```

### 2. Navigate to app:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

### 3. Check status:
```bash
pm2 status
```

### 4. Restart all processes:
```bash
pm2 restart all
```

### 5. Check logs:
```bash
pm2 logs --lines 10
```

### 6. Test application:
```bash
curl http://localhost:8080/api/stores
```

Should return JSON with your 2 stores.

### 7. Test website:
Open: https://opt.vivaindia.com

---

## If Application Won't Start:
```bash
# Check if the process exists
pm2 delete all

# Start fresh
npm start &

# Or start with PM2
pm2 start ecosystem.config.js
```

## Environment Check:
```bash
# Check environment variables
cat .env

# Should contain:
# DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro
# NODE_ENV=production
# PORT=8080
```

Your application should be accessible at https://opt.vivaindia.com after restart!