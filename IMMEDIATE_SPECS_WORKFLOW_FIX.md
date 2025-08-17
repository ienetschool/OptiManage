# 🚨 IMMEDIATE SPECS WORKFLOW 404 FIX - PRODUCTION DEPLOYMENT

## ❌ **ISSUE IDENTIFIED**
The /specs-workflow route is returning 404 on production because the server-side routing is not configured for Single Page Application (SPA) support.

## ✅ **FIX IMPLEMENTED**
Updated `server/routes.ts` with proper SPA routing configuration:

```javascript
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
```

## 🚀 **IMMEDIATE PRODUCTION DEPLOYMENT REQUIRED**

### **Option 1: SSH Access (RECOMMENDED)**
```bash
ssh vivassh@5.181.218.15
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Backup and update routes.ts
cp server/routes.ts server/routes.ts.backup.$(date +%Y%m%d_%H%M%S)

# Apply the SPA routing fix
nano server/routes.ts
# Find line 362: "Dashboard route bypass" 
# Replace the dashboard route section with the full SpaRoutes array above

# Restart production server
pm2 restart optistore-main

# Verify fix
curl http://localhost:8080/specs-workflow
```

### **Option 2: Quick GitHub Deploy**
```bash
# Copy files to production
rsync -avz server/routes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/server/
ssh vivassh@5.181.218.15 "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql && pm2 restart optistore-main"
```

## ✅ **VERIFICATION STEPS**
1. Visit: https://opt.vivaindia.com/specs-workflow
2. Should load React app instead of 404
3. Navigate to Patient Management → Specs Workflow
4. Verify all 7 workflow steps are accessible

## 📋 **STATUS**
- **Development**: ✅ Working (http://localhost:5000/specs-workflow)
- **Production**: ❌ 404 Error (needs deployment)
- **Fix**: ✅ Ready for deployment
- **Estimated Fix Time**: 2-3 minutes

## 🎯 **CRITICAL NEXT STEP**
**Deploy the SPA routing fix to production server immediately to resolve the 404 error.**