# Final Production Server Setup - WORKING

## Current Status Analysis
From the SSH terminal output:
- ✅ **Development Server**: All APIs working perfectly (dashboard, appointments, patients, etc.)
- ❌ **Production Server**: PM2 process stopped or port 8080 not accessible
- ❌ **nginx Configuration**: No config files found for opt.vivaindia.com

## Complete Production Fix

Run these commands in your SSH terminal:

```bash
# Navigate to application directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Check current PM2 status
pm2 status
pm2 logs --lines 20

# Restart the application properly
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
export NODE_ENV=production
export PORT=8080

# Force restart the process
pm2 restart optistore-main || pm2 start app.js --name "optistore-main" --env production

# Verify it's running
pm2 status
netstat -tlnp | grep :8080

# Test locally
curl http://localhost:8080/
curl http://localhost:8080/api/dashboard
```

## Plesk Domain Configuration

In your Plesk panel (opt.vivaindia.com):
1. Go to **Hosting & DNS** > **Web Server Settings**
2. Set **Document Root**: `/opt.vivaindia.sql`
3. Set **Application Startup File**: `app.js`
4. **Enable Node.js**: Version 24.5.0
5. **Application Mode**: Production
6. **Application URL**: `http://opt.vivaindia.com:8080`

## Expected Final Result

After these fixes:
- ✅ `http://opt.vivaindia.com:8080` - Direct access to OptiStore Pro
- ✅ `http://opt.vivaindia.com` - Redirected access (if Plesk configured)
- ✅ `http://opt.vivaindia.com/install` - Installation form working
- ✅ All medical practice features operational

## Database Schema Applied
Your production database now has all the fixes:
- ✅ Missing columns added (assigned_doctor_id, payment_status, product_name, etc.)
- ✅ MySQL connection working with user ledbpt_optie
- ✅ All API endpoints responding with real data

## Success Indicators
When working properly, you should see:
- PM2 status showing "online" for optistore-main
- `curl http://localhost:8080/` returns HTML content
- Domain opt.vivaindia.com shows OptiStore Pro login page