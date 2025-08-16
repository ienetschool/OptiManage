#!/bin/bash

echo "DIRECT PRODUCTION TEST AND RESTART"
echo "==================================="

# Test current production status
echo "1. Testing current production status..."
curl -s -w "Production Status: %{http_code}\n" "https://opt.vivaindia.com/api/dashboard" | head -1

# SSH and diagnose issue
ssh root@5.181.218.15 << 'ENDSSH'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo ""
echo "2. Checking current processes..."
ps aux | grep tsx | grep -v grep
ps aux | grep node | grep -v grep

echo ""
echo "3. Checking port 8080..."
netstat -tlnp | grep 8080

echo ""
echo "4. Checking recent logs..."
if [ -f production.log ]; then
    echo "Last 20 lines of production.log:"
    tail -20 production.log
else
    echo "No production.log found"
fi

echo ""
echo "5. Testing tsx command..."
which tsx
tsx --version

echo ""
echo "6. Checking file permissions..."
ls -la server/

echo ""
echo "7. Testing database connection..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" node -e "
const mysql = require('mysql2/promise');
async function test() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Database connection: SUCCESS');
    await connection.end();
  } catch (err) {
    console.log('Database connection: FAILED -', err.message);
  }
}
test();
"

echo ""
echo "8. Kill any stuck processes and restart..."
pkill -f tsx
pkill -f node
sudo fuser -k 8080/tcp

echo ""
echo "9. Starting server in foreground (will show errors)..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts
ENDSSH