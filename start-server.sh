#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f "node.*server" 2>/dev/null || true
sleep 3
nohup node production-server.js > server.log 2>&1 &
echo "Server started with PID: $!"
sleep 5
ps aux | grep "node production-server" | grep -v grep
curl -s http://localhost:8080/health || echo "Server not responding yet"
