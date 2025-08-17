# 🚨 IMMEDIATE SSH COMMANDS TO FIX SPECS WORKFLOW 404

## **Execute these commands directly on the production server:**

```bash
# SSH into production server
ssh vivassh@5.181.218.15

# Navigate to project directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Backup current routes file
cp server/routes.ts server/routes.ts.backup.$(date +%Y%m%d_%H%M%S)

# Edit the routes file to add SPA support
nano server/routes.ts
```

## **In nano editor, find line ~362 that says:**
```javascript
  // Dashboard route bypass - serve React app directly
  app.get('/dashboard*', (req, res, next) => {
    // Let this pass through to Vite to serve the React app
    next();
  });
```

## **Replace that entire section with:**
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

## **Save and restart:**
```bash
# Save in nano: Ctrl+X, then Y, then Enter

# Restart production server
pm2 restart optistore-main

# Test the fix
curl http://localhost:8080/specs-workflow
```

## **Verification:**
Visit: https://opt.vivaindia.com/specs-workflow
Should now load the React app instead of 404 error.

---

## **Alternative Quick Fix (One-liner):**
```bash
ssh vivassh@5.181.218.15 "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql && cp server/routes.ts server/routes.ts.backup.\$(date +%Y%m%d_%H%M%S) && sed -i '/Dashboard route bypass/,/});/c\\n  // SPA routes\\n  const spaRoutes = [\\n    \"/dashboard*\",\\n    \"/specs-workflow*\",\\n    \"/appointments*\",\\n    \"/patients*\",\\n    \"/patient-management*\",\\n    \"/prescriptions*\",\\n    \"/invoices*\",\\n    \"/billing*\",\\n    \"/staff*\",\\n    \"/inventory*\",\\n    \"/stores*\",\\n    \"/reports*\",\\n    \"/settings*\"\\n  ];\\n\\n  spaRoutes.forEach(route => {\\n    app.get(route, (req, res, next) => {\\n      next();\\n    });\\n  });' server/routes.ts && pm2 restart optistore-main"
```

## **Expected Result:**
✅ https://opt.vivaindia.com/specs-workflow loads correctly
✅ All 7-step lens prescription workflow accessible
✅ No more 404 errors on frontend routes