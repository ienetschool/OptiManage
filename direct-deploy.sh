#!/bin/bash

# Direct deployment to production server
echo "Deploying server directly to production..."

# Create the deployment package
tar -czf deploy.tar.gz server/ shared/ client/ package.json

# Upload and start server
cat > deploy-commands.sh << 'EOF'
#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f tsx 2>/dev/null || true
pkill -f node 2>/dev/null || true
mkdir -p server shared client
npm install express tsx mysql2 @types/node 2>/dev/null || true
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > server.log 2>&1 &
sleep 5
ps aux | grep tsx | grep -v grep
curl -s http://localhost:8080/api/dashboard || echo "Server not responding"
EOF

chmod +x deploy-commands.sh

echo "Deployment commands created. Server will start on port 8080."