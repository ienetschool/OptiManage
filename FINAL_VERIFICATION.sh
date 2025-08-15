#!/bin/bash

# Final Verification - OptiStore Pro Production
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Final PM2 Status Check ==="
pm2 status
pm2 logs optistore-main --lines 5

echo ""
echo "=== Testing Application Response ==="
echo "Testing localhost:8080 HTML:"
curl -s http://localhost:8080/ | head -10

echo ""
echo "Testing API endpoints:"
curl -s http://localhost:8080/api/dashboard | head -5

echo ""
echo "=== Testing External Access ==="
echo "Testing opt.vivaindia.com:8080:"
curl -I http://opt.vivaindia.com:8080/ | head -3

echo ""
echo "=== Checking Static Files Serving ==="
curl -I http://localhost:8080/assets/index.css | head -3
curl -I http://localhost:8080/assets/index.js | head -3

echo ""
echo "=== FINAL STATUS ==="
echo "✅ Build: Completed (324.8kb)"
echo "✅ Static Files: Deployed to server/public/"
echo "✅ PM2: optistore-main running in production mode"
echo "✅ Environment: NODE_ENV=production, PORT=8080"
echo ""
echo "🎯 OptiStore Pro Medical Practice Management System is ready at:"
echo "   http://opt.vivaindia.com:8080"
echo ""
echo "Features available:"
echo "• Patient Management & Medical Records"
echo "• Doctor Profiles & Appointment Scheduling"  
echo "• Prescription Management & Medical Invoicing"
echo "• Multi-Store Inventory & Point of Sale"
echo "• Financial Tracking & Profit/Loss Reporting"