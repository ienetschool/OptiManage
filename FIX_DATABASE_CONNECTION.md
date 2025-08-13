# Fix Database Connection Issue

## Problem Identified
PM2 logs show: "Error: DATABASE_URL must be set"
The application can't find the environment variables.

## Solution

### 1. Create production environment file
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=OptiStore-Pro-2025-Secret
EOF
```

### 2. Delete and restart PM2 with environment
```bash
pm2 delete optistore-pro
pm2 start dist/index.js --name optistore-pro --env production
```

### 3. Alternative: Start with explicit env file
```bash
pm2 start ecosystem.config.js
```

Where ecosystem.config.js contains:
```javascript
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt'
    }
  }]
}
```

### 4. Check status
```bash
pm2 status
pm2 logs optistore-pro --lines 10
```

The application should now start without database errors.