#!/bin/bash

echo "🧪 TESTING PRODUCTION SERVER DIRECTLY"
echo "===================================="

# Test production server directly
ssh root@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Current server status:"
ps aux | grep tsx | grep -v grep

echo "Port 8080 status:"
netstat -tlnp | grep :8080

echo "Testing dashboard API:"
curl -s http://localhost:8080/api/dashboard | head -c 200

echo "Testing patient registration:"
curl -s -X POST http://localhost:8080/api/patients -H "Content-Type: application/json" -d '{"firstName":"DirectTest","lastName":"Production","phone":"8888888888","email":"direct@prod.test"}' | head -c 300

echo "Production logs:"
tail -20 production.log
EOF

echo "Production server test complete"