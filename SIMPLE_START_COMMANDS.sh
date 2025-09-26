#!/bin/bash

# Simple PM2 Start Commands - No Ecosystem File
# Run these in your SSH terminal

cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Delete all processes
pm2 delete all

# Start directly with environment variables inline
pm2 start "npx tsx server/index.ts" \
  --name "optistore-main" \
  --env NODE_ENV=production \
  --env PORT=8080 \
  --env DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Alternative method if above fails - use shell script
cat > start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
npx tsx server/index.ts
EOF

chmod +x start.sh

# Start with shell script
pm2 delete optistore-main 2>/dev/null || true
pm2 start ./start.sh --name optistore-main

# Check results
sleep 10
pm2 status
pm2 logs optistore-main --lines 15
netstat -tlnp | grep :8080