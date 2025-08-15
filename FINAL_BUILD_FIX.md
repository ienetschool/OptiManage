# Final Build Directory Fix

## Current Status
✅ **Build Successful**: Client built to dist/ directory (324.8kb)  
✅ **PM2 Running**: optistore-main online with 3.3mb memory  
❌ **Wrong Path**: Server looking for server/public instead of dist  

## Final Fix Commands

```bash
# Navigate to app directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Copy/link built files to where server expects them
mkdir -p server/public
cp -r dist/* server/public/

# Alternative: Create symbolic link
ln -sf /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/dist /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/public

# Restart PM2 to pick up the files
pm2 restart optistore-main

# Wait and check
sleep 10
pm2 logs optistore-main --lines 10
netstat -tlnp | grep :8080

# Test the application
curl -I http://localhost:8080
curl http://localhost:8080 | head -20
```

## Expected Result
- No more "Could not find build directory" errors
- Port 8080 serving the complete application
- opt.vivaindia.com:8080 accessible with full UI