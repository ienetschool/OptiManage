# Simple Production Setup Commands

## Current Status
- PM2 is running but no processes active
- Need to start OptiStore Pro application
- Database connection confirmed working

## Commands to Execute

### Step 1: Start Application with PM2
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app

# Start the application
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="8080" pm2 start dist/index.js --name optistore-pro

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

### Step 2: Verify Application is Running
```bash
# Check PM2 status
pm2 status

# Test local connection
curl http://localhost:8080

# Check application logs
pm2 logs optistore-pro --lines 20
```

### Step 3: Open Firewall Port
```bash
# Add port to firewall
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Verify firewall rules
sudo firewall-cmd --list-ports
```

### Step 4: Test External Access
```bash
# Test from server
curl http://opt.vivaindia.com:8080

# Expected response: HTML content from OptiStore Pro
```

## Expected Results
After running these commands:
1. `pm2 status` should show optistore-pro as "online"
2. Application should respond on http://localhost:8080
3. External access should work on http://opt.vivaindia.com:8080
4. All medical practice features should be accessible

## Troubleshooting
If issues persist:
- Check `pm2 logs optistore-pro` for error messages
- Verify database connection with `psql -h localhost -U ledbpt_opt -d ieopt`
- Test different port (3000) if 8080 has conflicts