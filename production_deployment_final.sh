#!/bin/bash

echo "FINAL PERMANENT PRODUCTION DEPLOYMENT"
echo "====================================="

# Create deployment package with all fixes
tar -czf permanent_production_fix.tar.gz \
  server/ \
  package.json \
  tsconfig.json \
  ecosystem.config.js \
  start_production.sh \
  optistore.service \
  server_optimized.js \
  db_pool_config.js

echo ""
echo "PERMANENT SOLUTION READY"
echo "========================"
echo ""
echo "Upload permanent_production_fix.tar.gz to your server and run:"
echo ""
echo "# SSH into production"
echo "ssh root@5.181.218.15"
echo ""
echo "# Navigate and extract"
echo "cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
echo "tar -xzf permanent_production_fix.tar.gz"
echo ""
echo "# Run permanent setup (ONE TIME ONLY)"
echo "./start_production.sh"
echo ""
echo "# Install systemd service (ULTIMATE RELIABILITY)"
echo "cp optistore.service /etc/systemd/system/"
echo "systemctl enable optistore"
echo "systemctl start optistore"
echo ""
echo "AFTER THIS SETUP:"
echo "- Server auto-starts on boot"
echo "- Auto-restarts on crashes"
echo "- Memory optimized to prevent crashes"
echo "- Database connection pooling"
echo "- Complete monitoring and logging"
echo ""
echo "YOU WILL NEVER NEED SSH COMMANDS AGAIN!"