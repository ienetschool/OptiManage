#!/bin/bash

# Final Server Configuration Fix
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== Opening Port 3000 in Firewall ==="
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

echo "=== Restarting Nginx ==="
systemctl restart nginx

echo "=== Checking PM2 Status ==="
pm2 status

echo "=== Testing All Access Points ==="
echo "Testing localhost:8080..."
curl -I http://localhost:8080/ | head -5

echo ""
echo "Testing opt.vivaindia.com..."  
curl -I http://opt.vivaindia.com/ | head -5

echo ""
echo "Testing port 3000..."
curl -I http://opt.vivaindia.com:3000/ | head -5

echo ""
echo "Testing direct port 8080..."
curl -I http://opt.vivaindia.com:8080/ | head -5

echo ""
echo "=== Testing API Endpoints ==="
curl -s http://opt.vivaindia.com/api/dashboard | head -3
curl -s http://opt.vivaindia.com:8080/api/dashboard | head -3

echo ""
echo "=== Final Status ==="
echo "🎯 Your OptiStore Pro should be accessible at:"
echo "   - http://opt.vivaindia.com"
echo "   - http://opt.vivaindia.com:3000" 
echo "   - http://opt.vivaindia.com:8080"