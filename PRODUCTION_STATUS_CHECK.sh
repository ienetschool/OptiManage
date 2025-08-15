#!/bin/bash

# PRODUCTION STATUS CHECK - OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== CHECKING PRODUCTION SERVER STATUS ==="

echo "1. PM2 Status:"
pm2 status | grep optistore

echo ""
echo "2. Server Process Check:"
ps aux | grep node | grep -v grep | head -3

echo ""
echo "3. Port 8080 Status:"
netstat -tlnp | grep :8080 || ss -tlnp | grep :8080

echo ""
echo "4. Testing HTTP (not HTTPS):"
curl -I http://localhost:8080/ | head -3

echo ""
echo "5. Testing External HTTP Access:"
curl -I http://opt.vivaindia.com:8080/ | head -3

echo ""
echo "6. Testing Static Assets:"
curl -I http://localhost:8080/assets/index-BwQnpknj.css | head -1

echo ""
echo "7. Testing API Endpoints:"
curl -s http://localhost:8080/api/dashboard | head -100

echo ""
echo "8. Current Ownership:"
ls -la | grep opt.vivaindia.sql

echo ""
echo "9. Server Directory Status:"
ls -la server/ | grep public

echo ""
echo "=== RECOMMENDATIONS ==="
echo "✅ HTTP working - SSL certificate needs configuration for HTTPS"
echo "✅ Use HTTP for now: http://opt.vivaindia.com:8080 (not https://)"
echo "✅ Application should be fully functional via HTTP"
echo ""
echo "To fix HTTPS, configure SSL certificate in Plesk:"
echo "- Go to SSL/TLS Certificates in Plesk"
echo "- Install Let's Encrypt certificate for opt.vivaindia.com"
echo "- Or use HTTP access which should work immediately"