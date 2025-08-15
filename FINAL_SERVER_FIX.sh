#!/bin/bash

# FINAL SERVER FIX - OptiStore Pro Production
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== FIXING PORT 8080 BINDING ISSUE ==="

# 1. Kill any existing processes
pkill -f "node.*server/index.ts" 2>/dev/null || true
pkill -f "tsx.*server/index.ts" 2>/dev/null || true
pm2 delete optistore-main 2>/dev/null || true

# 2. Check what processes are running
echo "Current node processes:"
ps aux | grep node | grep -v grep

# 3. Create a simple production server file that definitely works
cat > production-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'server/public')));

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OptiStore Pro serving on port ${PORT}`);
  console.log(`Access at: http://opt.vivaindia.com:${PORT}`);
});
EOF

# 4. Install required packages
npm install express

# 5. Start the simple server first
echo "Starting simple static server on port 8080..."
NODE_ENV=production PORT=8080 node production-server.js &
SIMPLE_PID=$!

sleep 5

# 6. Test if port 8080 is now working
echo "Testing port 8080:"
netstat -tlnp | grep :8080
curl -I http://localhost:8080/ | head -2

# 7. If simple server works, start the full application
if curl -s http://localhost:8080/ > /dev/null; then
    echo "✅ Port 8080 is accessible! Stopping simple server and starting full app..."
    kill $SIMPLE_PID
    sleep 2
    
    # Start full application
    NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" npx tsx server/index.ts &
    FULL_PID=$!
    
    sleep 10
    echo "Testing full application:"
    curl -I http://localhost:8080/ | head -2
    echo "Application PID: $FULL_PID"
else
    echo "❌ Port 8080 still not accessible. Check server configuration."
    echo "Simple server PID: $SIMPLE_PID"
fi

echo ""
echo "=== FINAL STATUS ==="
echo "Port 8080 processes:"
netstat -tlnp | grep :8080 || echo "No processes on port 8080"
echo ""
echo "Try accessing: http://opt.vivaindia.com:8080"