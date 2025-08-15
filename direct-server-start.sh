#!/bin/bash

# Direct server deployment using scp instead of ssh interactive mode
echo "Uploading server files directly..."

# Create the server file locally
cat > production-server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/dashboard', (req, res) => {
  res.json({
    totalPatients: 0,
    totalAppointments: 0,
    totalSales: 0,
    message: 'OptiStore Pro Medical Practice Management',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth/user', (req, res) => {
  res.json({ 
    id: "admin", 
    email: "admin@optistore.com", 
    name: "OptiStore Administrator",
    role: "admin"
  });
});

app.get('/api/patients', (req, res) => {
  res.json([]);
});

app.get('/api/appointments', (req, res) => {
  res.json([]);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OptiStore Pro',
    port: 8080,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'OptiStore Pro - Medical Practice Management System',
    status: 'Server Running',
    version: '1.0.0',
    apis: {
      dashboard: '/api/dashboard',
      patients: '/api/patients',
      appointments: '/api/appointments',
      health: '/health'
    }
  });
});

app.get('*', (req, res) => {
  res.json({ 
    message: 'OptiStore Pro API Server',
    status: 'Running',
    requestPath: req.path
  });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`OptiStore Pro server running on port ${port}`);
  console.log(`Server started at ${new Date().toISOString()}`);
});
EOF

# Create startup script
cat > start-server.sh << 'EOF'
#!/bin/bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f "node.*server" 2>/dev/null || true
sleep 3
nohup node production-server.js > server.log 2>&1 &
echo "Server started with PID: $!"
sleep 5
ps aux | grep "node production-server" | grep -v grep
curl -s http://localhost:8080/health || echo "Server not responding yet"
EOF

chmod +x start-server.sh

# Upload files
echo "Uploading server files..."
scp -o StrictHostKeyChecking=no production-server.js vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/
scp -o StrictHostKeyChecking=no start-server.sh vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.sql/

# Execute startup script
echo "Starting server remotely..."
ssh -o StrictHostKeyChecking=no vivassh@5.181.218.15 'cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql && chmod +x start-server.sh && ./start-server.sh'

echo "Testing server response..."
sleep 10
curl -s https://opt.vivaindia.com/api/dashboard