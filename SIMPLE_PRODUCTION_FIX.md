# Simple Production Server Fix

## Current Status
Your production server at opt.vivaindia.com shows "Server not responding" with Phusion Passenger error page.

## Quick Diagnostic Commands
SSH to your server and run these commands to find and fix the application:

```bash
# SSH to your production server
ssh root@5.181.218.15

# Step 1: Find your running Node.js application
ps aux | grep node | grep -v grep
netstat -tlnp | grep :8080

# Step 2: Check PM2 processes (most likely scenario)
pm2 list
pm2 status

# Step 3: Find application directories
find /var/www -name "package.json" -type f 2>/dev/null
find /home -name "package.json" -type f 2>/dev/null
ls -la /var/www/vhosts/
ls -la /var/www/html/

# Step 4: Check Plesk/Passenger configuration
ls -la /var/www/vhosts/opt.vivaindia.com/
ls -la /var/www/vhosts/vivaindia.com/
```

## Most Likely Fix Scenarios

### Scenario 1: PM2 Process Stopped
If `pm2 list` shows stopped processes:
```bash
pm2 restart all
pm2 save
```

### Scenario 2: Application in Standard Plesk Location
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
# or
cd /var/www/vhosts/vivaindia.com/subdomains/opt/httpdocs/

# Check if it's a Node.js app
ls -la
cat package.json

# Start/restart the application
pm2 restart all || npm start &
```

### Scenario 3: Custom Application Location
Once you find the correct directory with `find` commands above:
```bash
cd /path/to/your/app  # Use the actual path found

# Update database connection
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Restart the application
pm2 restart all
pm2 logs --lines 20
```

## Test After Fix
```bash
# Test if application is responding
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/

# Check if it's accessible externally
curl http://opt.vivaindia.com:8080/
```

## Expected Result
After restart, opt.vivaindia.com should show your OptiStore Pro application instead of the error page.

## If Still Not Working
1. Check application logs: `pm2 logs`
2. Check system logs: `tail -f /var/log/messages`
3. Verify database connection: `mysql -h localhost -u ledbpt_optie -p opticpro`
4. Restart web server: `systemctl restart nginx` or `systemctl restart apache2`