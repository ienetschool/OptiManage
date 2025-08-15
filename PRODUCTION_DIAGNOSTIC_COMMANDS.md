# Production Server Diagnostic Commands

## Run These Commands in Your SSH Terminal:

```bash
# 1. Find your OptiStore application directory
find / -name "*opti*" -type d 2>/dev/null | head -10
find /var/www -name "*opt*" -type d 2>/dev/null

# 2. Check PM2 processes
pm2 list
pm2 status

# 3. Look for Node.js processes
ps aux | grep node | grep -v grep

# 4. Find package.json files (Node.js applications)
find /var/www -name "package.json" 2>/dev/null
find /home -name "package.json" 2>/dev/null

# 5. Check what's listening on port 8080
netstat -tlnp | grep :8080

# 6. Check Plesk directory structure
ls -la /var/www/vhosts/
ls -la /var/www/vhosts/opt.vivaindia.com/ 2>/dev/null || echo "opt.vivaindia.com not found"
ls -la /var/www/vhosts/vivaindia.com/ 2>/dev/null || echo "vivaindia.com not found"

# 7. Check for common web directories
ls -la /var/www/html/
ls -la /home/
```

## After Finding the Application Directory:

Once you locate the correct path (look for a directory containing `package.json`), run:

```bash
cd /path/to/your/optistore/app  # Replace with actual path found above

# Check if it's the right application
ls -la
cat package.json | grep -i opti

# Set database connection
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Apply database schema fixes
curl -X POST http://localhost:8080/api/fix-mysql-schema 2>/dev/null || echo "Schema fix endpoint not responding"

# Restart PM2 processes
pm2 restart all
pm2 save

# Check status
pm2 status
pm2 logs --lines 10

# Test application
curl http://localhost:8080/api/dashboard 2>/dev/null | head -c 50
```

## What to Look For:

1. **Application Directory** should contain:
   - `package.json` with "optistore" or similar
   - `server/` folder
   - `client/` folder
   - `node_modules/`

2. **PM2 Processes** should show:
   - Running Node.js applications
   - Process names like "optistore", "optistore-pro", or similar

3. **Port 8080** should show:
   - A Node.js process listening on this port

Copy and paste these commands into your SSH terminal one by one and share the output so I can identify the correct application path.