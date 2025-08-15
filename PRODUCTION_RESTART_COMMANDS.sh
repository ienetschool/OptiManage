#!/bin/bash

# OptiStore Pro Production Server Restart Commands
# Run these commands on your production server (5.181.218.15)

echo "🔧 Starting OptiStore Pro Production Server Fix..."

# Navigate to application directory
cd /var/www/vivaindia.com/opt.vivaindia.sql

# Update environment with MySQL connection
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
echo "✅ Updated DATABASE_URL"

# Apply database schema fixes
echo "🔧 Applying database schema fixes..."
curl -X POST http://localhost:8080/api/fix-mysql-schema || curl -X POST http://localhost:8080/api/force-mysql-fix
echo "✅ Schema fixes applied"

# Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart all
pm2 restart optistore-pro 2>/dev/null || echo "optistore-pro process not found"
pm2 restart optistore 2>/dev/null || echo "optistore process not found"

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

# Test the application
echo "🧪 Testing application endpoints..."
curl -s http://localhost:8080/api/dashboard | head -c 100
curl -s http://localhost:8080/api/appointments | head -c 50

# Show recent logs
echo "📋 Recent application logs:"
pm2 logs --lines 10

echo "✅ Production server restart complete!"
echo "🌐 Your application should now be accessible at:"
echo "   - http://opt.vivaindia.com:8080 (direct)"
echo "   - http://opt.vivaindia.com (redirected)"
echo "   - http://opt.vivaindia.com/install (installation form)"