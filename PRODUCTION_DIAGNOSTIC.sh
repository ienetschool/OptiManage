#!/bin/bash

# Production Server Diagnostic and Fix
echo "DIAGNOSING PRODUCTION SERVER ISSUE"
echo "=================================="

ssh vivassh@5.181.218.15 << 'EOF'
echo "1. Current directory and files:"
cd /var/www/vhosts/vivaindia.com/opt
pwd
ls -la server/index.ts || echo "server/index.ts not found"

echo ""
echo "2. Checking running processes:"
ps aux | grep -E "(tsx|node)" | grep -v grep || echo "No Node processes running"

echo ""
echo "3. Checking port 8080:"
netstat -tlnp | grep :8080 || echo "Port 8080 not in use"

echo ""
echo "4. Checking recent logs:"
if [ -f production.log ]; then
    echo "Last 10 lines of production.log:"
    tail -10 production.log
else
    echo "No production.log file found"
fi

echo ""
echo "5. Testing server startup:"
echo "Stopping any existing processes..."
pkill -f tsx || echo "No tsx processes to kill"
sleep 2

echo "Starting server with full logging..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' npx tsx server/index.ts &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

echo "Waiting 10 seconds for server initialization..."
sleep 10

echo ""
echo "6. Server status check:"
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server process is running (PID: $SERVER_PID)"
else
    echo "❌ Server process died"
fi

echo ""
echo "7. Port check:"
netstat -tlnp | grep :8080 && echo "✅ Port 8080 is listening" || echo "❌ Port 8080 not listening"

echo ""
echo "8. Local API test:"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:8080/api/dashboard | head -c 100

echo ""
echo "Moving server to background..."
disown $SERVER_PID
EOF