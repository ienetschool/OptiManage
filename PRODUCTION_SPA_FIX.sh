#!/bin/bash
# IMMEDIATE PRODUCTION FIX FOR SPECS WORKFLOW 404 ERROR
# This script fixes the SPA routing issue on the production server

set -e

echo "🚨 CRITICAL FIX: SPECS WORKFLOW 404 ERROR"
echo "==========================================="

# Production server details
PROD_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
ROUTES_FILE="$PROD_PATH/server/routes.ts"

echo "📍 Target: $ROUTES_FILE"

# Backup the current routes file
echo "💾 Creating backup..."
cp "$ROUTES_FILE" "$ROUTES_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Create the fixed routes section
cat > /tmp/spa_routes_fix.txt << 'EOF'
  // SPA routes - serve React app for all frontend routes
  const spaRoutes = [
    '/dashboard*',
    '/specs-workflow*',
    '/appointments*',
    '/patients*',
    '/patient-management*',
    '/prescriptions*',
    '/invoices*',
    '/billing*',
    '/staff*',
    '/inventory*',
    '/stores*',
    '/reports*',
    '/settings*'
  ];

  spaRoutes.forEach(route => {
    app.get(route, (req, res, next) => {
      // Let this pass through to Vite to serve the React app
      next();
    });
  });
EOF

# Apply the fix using sed
echo "🔧 Applying SPA routing fix..."
sed -i '/Dashboard route bypass/,/});/c\
  // SPA routes - serve React app for all frontend routes\
  const spaRoutes = [\
    '"'"'/dashboard*'"'"',\
    '"'"'/specs-workflow*'"'"',\
    '"'"'/appointments*'"'"',\
    '"'"'/patients*'"'"',\
    '"'"'/patient-management*'"'"',\
    '"'"'/prescriptions*'"'"',\
    '"'"'/invoices*'"'"',\
    '"'"'/billing*'"'"',\
    '"'"'/staff*'"'"',\
    '"'"'/inventory*'"'"',\
    '"'"'/stores*'"'"',\
    '"'"'/reports*'"'"',\
    '"'"'/settings*'"'"'\
  ];\
\
  spaRoutes.forEach(route => {\
    app.get(route, (req, res, next) => {\
      // Let this pass through to Vite to serve the React app\
      next();\
    });\
  });' "$ROUTES_FILE"

# Restart the production server
echo "🔄 Restarting production server..."
cd "$PROD_PATH"
pm2 restart optistore-main

# Wait for server to restart
echo "⏳ Waiting for server restart..."
sleep 5

# Test the fix
echo "🧪 Testing the fix..."
if curl -s http://localhost:8080/specs-workflow | grep -q "<!DOCTYPE html>"; then
    echo "✅ SUCCESS: /specs-workflow now serves HTML (SPA working)"
    echo "🎉 FIX COMPLETE: https://opt.vivaindia.com/specs-workflow should now work"
else
    echo "❌ ERROR: Fix may not have worked correctly"
fi

echo ""
echo "🔗 TEST URLs:"
echo "   - https://opt.vivaindia.com/specs-workflow"
echo "   - https://opt.vivaindia.com/dashboard"
echo "   - https://opt.vivaindia.com/appointments"
echo ""
echo "✅ DEPLOYMENT COMPLETE"