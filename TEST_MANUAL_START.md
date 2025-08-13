# Test Manual Application Start

## Files Confirmed
✅ dist/index.js exists (278889 bytes)
✅ Built application is ready

## Next Commands to Run

### 1. Test manual start (to verify the app works)
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" node dist/index.js
```

If this works, you should see output like:
- "serving on port 5000"
- Database connection messages
- No errors

Press Ctrl+C to stop after confirming it works.

### 2. If manual works, try PM2 with verbose logging
```bash
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" pm2 start dist/index.js --name optistore-pro --log /tmp/pm2.log
```

### 3. Check PM2 status immediately
```bash
pm2 status
pm2 logs optistore-pro
```

### 4. Alternative: Create environment file method
```bash
echo 'DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
NODE_ENV=production
PORT=5000' > .env

pm2 start dist/index.js --name optistore-pro
```

The manual test will confirm if the application itself works.