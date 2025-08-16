#!/bin/bash
echo "🚀 Deploying UPDATE endpoints to production..."

# Navigate to project directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop current server
echo "Stopping production server..."
pkill -f tsx
sudo fuser -k 8080/tcp
sleep 3

# Backup current file
cp server/medicalRoutes.ts server/medicalRoutes.ts.backup.$(date +%Y%m%d_%H%M%S)

# Copy new file (assuming it's uploaded to /tmp)
if [ -f /tmp/medicalRoutes.ts ]; then
    cp /tmp/medicalRoutes.ts server/medicalRoutes.ts
    echo "✅ medicalRoutes.ts updated with UPDATE endpoints"
else
    echo "❌ medicalRoutes.ts not found in /tmp"
    exit 1
fi

# Start production server
echo "Starting production server with UPDATE endpoints..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" PORT=8080 NODE_ENV=production tsx server/index.ts > production.log 2>&1 &

# Wait for startup
sleep 10

# Verify server
echo "Checking server status..."
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep 8080

# Test UPDATE endpoint
echo "Testing UPDATE endpoint..."
curl -s -X PUT http://localhost:8080/api/patients/test123 -H "Content-Type: application/json" -d '{"firstName":"ProductionUpdateTest"}' | head -c 100

echo "✅ Production UPDATE endpoints deployment complete!"
