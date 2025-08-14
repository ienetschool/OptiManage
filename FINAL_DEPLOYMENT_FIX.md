# Final PM2 Deployment Fix

## Issue Identified
PM2 error: "Script not found: /root/dist/index.js"
PM2 is looking in wrong directory - needs absolute path

## Solution Commands

### 1. Stop any existing PM2 processes
```bash
pm2 delete optistore-pro
pm2 kill
```

### 2. Start PM2 with absolute path
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
```

### 3. Alternative: Use PM2 ecosystem file
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: './dist/index.js',
    cwd: '/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app',
    env: {
      NODE_ENV: 'production',
      PORT: '5000',
      DATABASE_URL: 'postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

pm2 start ecosystem.config.js
```

### 4. Verify and save
```bash
pm2 status
pm2 save
pm2 startup
```

Use method 2 (absolute path) first - it's the simplest fix.