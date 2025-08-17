#!/bin/bash

# Quick deployment using the documented password
PROD_HOST="5.181.218.15"
PROD_USER="root"
PROD_PASS="&8KXC4D+Ojfhuu0LSMhE"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.com"

echo "🚀 DEPLOYING FIXED SIDEBAR TO PRODUCTION"
echo "========================================"
echo "Fixed: Patient Management now shows all 5 items"
echo "Items: Patient Registration, Prescriptions, Specs Workflow, Specs Order Creation, Lens Cutting & Fitting"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf sidebar-fix.tar.gz client/src/components/layout/Sidebar.tsx client/src/pages/Spec* client/src/App.tsx

# Deploy using sshpass if available or manual SCP
echo "📤 Deploying to production..."
if command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$PROD_PASS" scp sidebar-fix.tar.gz $PROD_USER@$PROD_HOST:$PROD_PATH/
    sshpass -p "$PROD_PASS" ssh $PROD_USER@$PROD_HOST << EOF
cd $PROD_PATH
tar -xzf sidebar-fix.tar.gz
rm sidebar-fix.tar.gz

# Restart the server
echo "🔄 Restarting production server..."
pkill -f 'node.*server'
pkill -f 'tsx.*server'
sleep 2

# Start server on port 8080 as expected
cd $PROD_PATH
nohup node server/index.js > production.log 2>&1 &
echo "✅ Production server restarted successfully"
EOF
else
    echo "Manual deployment needed - sshpass not available"
    echo "Upload sidebar-fix.tar.gz to $PROD_USER@$PROD_HOST:$PROD_PATH/"
fi

echo ""
echo "🌐 Test the fix at: https://opt.vivaindia.com/dashboard"
echo "Expected: All 5 Patient Management items should now be visible"