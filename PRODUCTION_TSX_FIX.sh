#!/bin/bash

# TSX COMMAND FIX - Install tsx globally and restart server
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== FIXING TSX COMMAND NOT FOUND ==="

# Stop current PM2 process
pm2 delete optistore-main

echo "1. Installing tsx globally:"
npm install -g tsx

echo ""
echo "2. Alternative: Build and run with Node.js:"
npm run build

echo ""
echo "3. Create production start script:"
cat > start-production.js << 'EOF'
// Production start script for OptiStore Pro
const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = '8080';
process.env.FORCE_PRODUCTION = 'true';
process.env.DATABASE_URL = 'mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro';

// Change to project directory
process.chdir(__dirname);

// Start the server
const child = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

console.log('Starting OptiStore Pro production server...');
EOF

echo ""
echo "4. Alternative: Create compiled JS version:"
cat > server-compiled.js << 'EOF'
// Simple Node.js server start
require('tsx/cjs');
require('./server/index.ts');
EOF

echo ""
echo "5. Starting with Node.js directly:"
pm2 start start-production.js --name "optistore-main"

echo ""
echo "6. Waiting for startup..."
sleep 10

echo ""
echo "7. Testing server response:"
curl -I http://localhost:8080/ | head -3

echo ""
echo "8. PM2 Status:"
pm2 status

echo ""
echo "9. Server logs:"
pm2 logs optistore-main --lines 5

echo ""
echo "=== ALTERNATIVE COMMANDS IF ABOVE FAILS ==="
echo "Try these manually:"
echo "pm2 delete optistore-main"
echo "pm2 start 'node --loader tsx/esm server/index.ts' --name optistore-main"
echo "OR:"
echo "npm install -g tsx"
echo "pm2 start 'tsx server/index.ts' --name optistore-main"