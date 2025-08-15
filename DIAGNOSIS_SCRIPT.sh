#!/bin/bash

# Production Server Diagnosis Script
echo "PRODUCTION SERVER DIAGNOSIS"
echo "=========================="

ssh vivassh@5.181.218.15 << 'EOF'
echo "1. Current location and files:"
cd /var/www/vhosts/vivaindia.com/ 2>/dev/null || echo "Could not find application directory"
pwd
ls -la | head -20

echo ""
echo "2. Checking if server directory exists:"
ls -la server/ 2>/dev/null || echo "Server directory not found"

echo ""
echo "3. Checking if server/index.ts exists:"
ls -la server/index.ts 2>/dev/null || echo "server/index.ts not found"

echo ""
echo "4. Checking Node.js and tsx:"
node --version 2>/dev/null || echo "Node.js not found"
which tsx 2>/dev/null || echo "tsx not found"

echo ""
echo "5. Checking processes:"
ps aux | grep -E "(tsx|node)" | grep -v grep || echo "No Node processes running"

echo ""
echo "6. Checking port 8080:"
netstat -tlnp | grep :8080 || echo "Port 8080 not listening"

echo ""
echo "7. Checking recent logs:"
if [ -f production.log ]; then
    echo "Last 10 lines of production.log:"
    tail -10 production.log
else
    echo "No production.log found"
fi

echo ""
echo "8. Testing tsx installation:"
npx tsx --version 2>/dev/null || echo "tsx installation test failed"

echo ""
echo "9. Database connection test:"
mysql -h localhost -u ledbpt_optie -pg79h94LAP -D opticpro -e "SELECT 1;" 2>/dev/null && echo "✅ Database connection works" || echo "❌ Database connection failed"
EOF