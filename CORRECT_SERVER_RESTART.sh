#!/bin/bash

# CORRECT Production Server Restart
# Using the CORRECT path and PostgreSQL database

echo "🔧 CORRECT SERVER RESTART"
echo "========================="
echo "Path: /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "Database: PostgreSQL ieopt"
echo ""

# Correct commands for your server
cat << 'EOF'
ssh vivassh@5.181.218.15 << 'REMOTE'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "Killing existing tsx processes..."
pkill -f 'tsx server/index.ts'

echo "Starting server with CORRECT PostgreSQL database..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@5.181.218.15/ieopt?schema=public' nohup npx tsx server/index.ts > production.log 2>&1 &

echo "Checking server status..."
sleep 3
ps aux | grep tsx | grep -v grep

echo "Testing port 8080..."
netstat -tlnp | grep :8080

echo "Checking production log..."
tail -5 production.log
REMOTE
EOF