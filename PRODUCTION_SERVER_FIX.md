# Production Server Fix - OptiStore Pro

## Current Status
- **Development Server**: ✅ Working perfectly on Replit (localhost:5000)
- **Database Schema**: ✅ All MySQL columns added and working
- **Production Server**: ❌ opt.vivaindia.com shows "Server not responding"

## Root Cause
Your production server at opt.vivaindia.com needs to be updated with:
1. The latest application code with database schema fixes
2. PM2 processes restarted with new configuration
3. Updated DATABASE_URL environment variable

## Production Server Fix Commands
SSH to your production server and run these commands:

```bash
# SSH to your production server
ssh root@5.181.218.15

# Navigate to your application directory
cd /var/www/opt.vivaindia.com  # or wherever your app is located

# Update environment with fixed DATABASE_URL
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Apply the database schema fixes
curl -X POST http://localhost:8080/api/force-mysql-fix || curl -X POST http://localhost:8080/api/fix-mysql-schema

# Restart PM2 processes
pm2 restart all
pm2 restart optistore-pro
pm2 restart optistore

# Check status
pm2 status
pm2 logs --lines 50

# Test the application
curl http://localhost:8080/api/dashboard
curl http://localhost:8080/api/appointments
```

## Expected Results
After running these commands, your domain should work:
- ✅ http://opt.vivaindia.com:8080 - Direct application access
- ✅ http://opt.vivaindia.com - Redirected access
- ✅ http://opt.vivaindia.com/install - Installation form working

## Alternative: Complete Redeployment
If PM2 restart doesn't work, redeploy the entire application:

```bash
# Stop current processes
pm2 stop all
pm2 delete all

# Re-upload your latest code and restart
# (Upload the fixed application files to production)

# Start fresh
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Database Verification
Verify your MySQL database has all the required columns:

```sql
DESCRIBE appointments;
DESCRIBE invoice_items;
DESCRIBE invoices;
```

Should show columns like: assigned_doctor_id, appointment_fee, payment_status, product_name, discount, total

---
**Status**: Production server needs manual intervention to apply fixes
**Next Step**: SSH to production server and run the above commands