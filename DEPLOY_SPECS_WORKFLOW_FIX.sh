#!/bin/bash
echo '🚀 DEPLOYING SPECS WORKFLOW FIX TO PRODUCTION'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Copy updated routes file
cp server/routes.ts server/routes.ts.backup.$(date +%Y%m%d_%H%M%S)
echo '✅ Backed up existing routes.ts'

# Apply the fix by updating the SPA routes section
sed -i '/Dashboard route bypass/,/});/c  // SPA routes - serve React app for all frontend routes  const spaRoutes = [    '/dashboard*',    '/specs-workflow*',    '/appointments*',    '/patients*',    '/patient-management*',    '/prescriptions*',    '/invoices*',    '/billing*',    '/staff*',    '/inventory*',    '/stores*',    '/reports*',    '/settings*'  ];  spaRoutes.forEach(route => {    app.get(route, (req, res, next) => {      // Let this pass through to Vite to serve the React app      next();    });  });' server/routes.ts

echo '✅ Applied SPA routing fix'

# Restart the production server
pm2 restart optistore-main
echo '✅ Production server restarted'

# Test the fix
sleep 3
curl -s http://localhost:8080/specs-workflow | head -5
echo '✅ Deployment complete - /specs-workflow should now be accessible'
