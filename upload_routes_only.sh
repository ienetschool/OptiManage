#!/bin/bash

# Quick fix: Upload only the routes file to production server
echo "🔧 Uploading updated routes.ts to production server..."

# Upload the updated routes file
scp server/routes.ts root@5.181.218.15:/var/www/vhosts/opt.vivaindia.com/httpdocs/server/routes.ts

echo "📡 Restarting application..."

# Restart the application
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 restart all"

echo "🧪 Testing MySQL connection endpoint..."

# Test the endpoint
ssh root@5.181.218.15 'curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"'

echo ""
echo "✅ Done! Now test https://opt.vivaindia.com/install"
echo "The connection test should work now."