# Quick Fix - 3 Simple Steps

## The Problem
You're trying to run npm commands but the OptiStore Pro files aren't on the server yet.

## Solution

### Step 1: First, upload your files
You need to get your OptiStore Pro application files (especially `package.json` and the entire project) to your server at:
```
/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
```

**Ways to upload:**
- **Plesk File Manager**: Use the file upload feature in Plesk
- **SCP**: `scp -r your-local-files/* root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/`
- **Git**: Clone your repository directly on the server

### Step 2: Skip Node.js conflicts for now
Since you're getting Node.js version conflicts, just use what's already installed:
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
ls -la  # Check if files are there
```

### Step 3: Deploy once files are uploaded
```bash
# Only run these AFTER files are uploaded
npm install --force  # Skip version conflicts
npm run build
pm2 start server/index.js --name optistore
```

## Alternative: Use Plesk Node.js Feature
Instead of manual setup:
1. Go to Plesk → opt.vivaindia.com → Node.js
2. Enable Node.js application
3. Set application root: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`
4. Set startup file: `server/index.js`
5. Upload your files via Plesk File Manager
6. Click "Install Dependencies" in Plesk
7. Start the application

This way Plesk handles everything automatically.