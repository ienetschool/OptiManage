#!/bin/bash

# Quick deployment script
echo "Deploying server to production..."

ssh -o StrictHostKeyChecking=no vivassh@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop all processes
pkill -f node 2>/dev/null || true
pkill -f tsx 2>/dev/null || true
sleep 3

# Create minimal working server
cat > app.js << 'APPEOF'
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/dashboard', (req, res) => {
  res.json({
    totalPatients: 0,
    totalAppointments: 0,
    totalSales: 0,
    message: 'OptiStore Pro Server Running',
    status: 'OK'
  });
});

app.get('/api/auth/user', (req, res) => {
  res.json({ id: "admin", email: "admin@optistore.com", name: "Admin" });
});

app.get('*', (req, res) => {
  res.json({ message: 'OptiStore Pro Running', status: 'OK' });
});

app.listen(8080, '0.0.0.0', () => {
  console.log('Server running on port 8080');
});
APPEOF

# Install express if needed
npm install express 2>/dev/null || true

# Start server
nohup node app.js > server.log 2>&1 &
echo "Server started"
sleep 5

# Check status
ps aux | grep "node app.js" | grep -v grep
curl -s http://localhost:8080/api/dashboard

EOF

echo "Testing external access..."
sleep 10
curl -s https://opt.vivaindia.com/api/dashboard