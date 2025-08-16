#!/bin/bash

# Direct production deployment without sshpass dependency
echo "Creating production deployment package..."

# Create a temporary directory for production files
mkdir -p production_package

# Copy the fixed medicalRoutes.ts to production package
cp server/medicalRoutes.ts production_package/

# Create deployment script for production server
cat > production_package/deploy_update_endpoints.sh << 'DEPLOY_SCRIPT'
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
DEPLOY_SCRIPT

chmod +x production_package/deploy_update_endpoints.sh

echo "Production package created. Manual deployment steps:"
echo "1. Upload medicalRoutes.ts to production server /tmp/"
echo "2. Run the deployment script on production server"
echo ""
echo "SCP Command to upload file:"
echo "scp production_package/medicalRoutes.ts root@5.181.218.15:/tmp/"
echo ""
echo "SSH Commands to deploy:"
echo "ssh root@5.181.218.15"
echo "chmod +x /tmp/deploy_update_endpoints.sh"
echo "/tmp/deploy_update_endpoints.sh"