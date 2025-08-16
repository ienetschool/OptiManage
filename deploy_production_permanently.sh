#!/bin/bash

echo "DEPLOYING PERMANENT PRODUCTION SOLUTION"
echo "========================================"

# Create PM2 ecosystem config with auto-restart and monitoring
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-production',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true
  }]
}
EOF

# Create startup script
cat > start_production.sh << 'EOF'
#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Create logs directory
mkdir -p logs

# Install dependencies if needed
npm install
npm install -g tsx pm2

# Stop any existing processes
pkill -f tsx
pkill -f node
sudo fuser -k 8080/tcp 2>/dev/null

# Start with PM2
pm2 delete optistore-production 2>/dev/null
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u root --hp /root

echo "Production server started with PM2 auto-restart"
pm2 status
EOF

chmod +x start_production.sh

# Create systemd service for ultimate reliability
cat > optistore.service << 'EOF'
[Unit]
Description=OptiStore Pro Medical Practice Management
After=network.target mysql.service

[Service]
Type=forking
User=root
WorkingDirectory=/var/www/vhosts/vivaindia.com/opt.vivaindia.sql
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro
ExecStart=/usr/bin/pm2 start ecosystem.config.js --no-daemon
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 delete optistore-production
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Created permanent deployment files:"
echo "- ecosystem.config.js (PM2 auto-restart configuration)"
echo "- start_production.sh (automated startup script)"
echo "- optistore.service (systemd service for boot persistence)"