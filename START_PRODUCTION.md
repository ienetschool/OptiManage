# Start Production Application

## Updated Ecosystem Config
The ecosystem.config.js file has been updated with proper formatting to avoid the malformation error.

## Next Steps for Server

### 1. Restart PM2 with updated config
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
pm2 start ecosystem.config.js
```

### 2. Check status
```bash
pm2 status
pm2 logs optistore-pro --lines 10
```

### 3. Test application locally
```bash
curl http://localhost:5000
```

### 4. Save PM2 configuration
```bash
pm2 save
pm2 startup
```

## Expected Results
- PM2 status: "online"
- No DATABASE_URL errors in logs
- Application responds to curl requests
- Website accessible at https://opt.vivaindia.com

## If Still Issues
Use direct environment method:
```bash
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" pm2 start dist/index.js --name optistore-pro
```