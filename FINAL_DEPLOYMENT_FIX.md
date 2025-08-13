# Final Deployment Fix - Simple Environment Variable Solution

## Issue
- Permission denied accessing ecosystem.config.js
- PM2 not reading environment variables from .env file
- Application crashes due to missing DATABASE_URL

## Simple Solution

### 1. Create ecosystem config manually
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt',
      COMPANY_NAME: 'OptiStore Pro',
      ADMIN_EMAIL: 'admin@opt.vivaindia.com',
      DOMAIN: 'https://opt.vivaindia.com',
      SESSION_SECRET: 'OptiStore-Pro-2025-Secret'
    }
  }]
}
EOF
```

### 2. Restart with ecosystem config
```bash
pm2 delete optistore-pro
pm2 start ecosystem.config.js
```

### 3. Alternative: Direct environment variables
If ecosystem doesn't work, use this:
```bash
pm2 delete optistore-pro
pm2 start dist/index.js --name optistore-pro --env production \
  --env DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" \
  --env NODE_ENV="production" \
  --env PORT="5000"
```

### 4. Test application
```bash
pm2 status
pm2 logs optistore-pro --lines 5
curl http://localhost:5000
```

### 5. Save PM2 configuration
```bash
pm2 save
pm2 startup
```

## Expected Result
- PM2 status shows "online"
- No DATABASE_URL errors in logs
- Application responds to curl localhost:5000
- Website works at https://opt.vivaindia.com