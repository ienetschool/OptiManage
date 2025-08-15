# Find Correct Production Folder Path

## Current Issue
The production server path needs to be verified. Multiple possible locations:

## Common Production Paths to Check:

1. **Plesk Standard Paths:**
   ```bash
   /var/www/vhosts/opt.vivaindia.com/
   /var/www/vhosts/opt.vivaindia.com/httpdocs/
   /var/www/vhosts/vivaindia.com/subdomains/opt/
   ```

2. **Alternative Paths:**
   ```bash
   /home/opt/
   /opt/opt-vivaindia/
   /var/www/html/opt/
   /usr/local/opt-vivaindia/
   ```

3. **PM2 Process Location Check:**
   ```bash
   pm2 list
   pm2 show optistore-pro
   pm2 show optistore
   ```

## Commands to Find the Correct Path:

SSH to your server and run these commands to locate your application:

```bash
# SSH to production server
ssh root@5.181.218.15

# Find all possible OptiStore locations
find / -name "*opti*" -type d 2>/dev/null | head -20
find /var/www -name "*opt*" -type d 2>/dev/null
find /home -name "*opt*" -type d 2>/dev/null

# Check PM2 processes for working directory
pm2 list
pm2 describe 0  # or whatever process ID shows

# Look for Node.js applications
ps aux | grep node
netstat -tlnp | grep :8080

# Check common web directories
ls -la /var/www/vhosts/
ls -la /var/www/html/
ls -la /home/

# Find package.json files (indicates Node.js apps)
find /var/www -name "package.json" 2>/dev/null
find /home -name "package.json" 2>/dev/null
```

## Once You Find the Correct Path:
Replace the path in the restart commands with the actual application directory.

The correct directory should contain:
- `package.json`
- `server/` folder
- `client/` folder  
- `node_modules/`
- PM2 ecosystem files