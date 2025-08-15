#!/bin/bash

echo "🔍 Debugging opt.vivaindia.com connection issue..."

# Test connection to server
echo "1. Testing server connectivity:"
ping -c 3 5.181.218.15

echo ""
echo "2. Testing SSH access:"
ssh -o ConnectTimeout=5 root@5.181.218.15 "echo 'SSH connection successful'"

echo ""
echo "3. Checking application status via SSH:"
ssh root@5.181.218.15 << 'EOF'
echo "Current directory contents:"
ls -la /var/www/vhosts/opt.vivaindia.com/httpdocs/

echo ""
echo "PM2 process status:"
pm2 status

echo ""
echo "Checking if application is listening on port 8080:"
netstat -tulpn | grep 8080

echo ""
echo "Testing local API endpoint:"
curl -s http://localhost:8080/api/stores | head -100

echo ""
echo "Checking environment variables:"
cat /var/www/vhosts/opt.vivaindia.com/httpdocs/.env | grep -v password

echo ""
echo "Application logs (last 10 lines):"
pm2 logs --lines 10
EOF

echo ""
echo "🔍 Diagnosis complete. Check the output above for issues."