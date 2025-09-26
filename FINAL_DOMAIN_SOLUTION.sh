#!/bin/bash

# FINAL DOMAIN SOLUTION - Complete OptiStore Pro Setup
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== OPTISTORE PRO FINAL DOMAIN CONFIGURATION ==="

# 1. Ensure production server is running with all API routes
echo "1. Checking and restarting production server..."
pkill -f "tsx.*server/index.ts" 2>/dev/null || true

# Start production server with full environment
export NODE_ENV=production
export PORT=8080
export FORCE_PRODUCTION=true
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

nohup npx tsx server/index.ts > optistore-production.log 2>&1 &
PROD_PID=$!
echo "Production server started with PID: $PROD_PID"

# 2. Wait for server startup
sleep 15

# 3. Test production server endpoints
echo "2. Testing production server endpoints..."
echo "Dashboard API:"
curl -I http://localhost:8080/api/dashboard | head -2

echo "Install API:"
curl -I http://localhost:8080/api/install/test-connection | head -2

echo "Main application:"
curl -I http://localhost:8080/ | head -2

# 4. Verify port binding
echo "3. Port 8080 status:"
netstat -tlnp | grep :8080 || echo "Port 8080 not listening"

# 5. Create simple domain redirect as fallback
echo "4. Creating domain fallback..."
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs
cat > /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/index.php << 'EOF'
<?php
// OptiStore Pro Domain Handler
$host = $_SERVER['HTTP_HOST'];
$uri = $_SERVER['REQUEST_URI'];

// Proxy to port 8080
$target_url = "http://127.0.0.1:8080" . $uri;

// Set headers
$headers = array();
foreach($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $header = str_replace('HTTP_', '', $key);
        $header = str_replace('_', '-', $header);
        $headers[] = $header . ': ' . $value;
    }
}

// Make request
$context = stream_context_create([
    'http' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'header' => implode("\r\n", $headers),
        'content' => file_get_contents('php://input')
    ]
]);

$response = file_get_contents($target_url, false, $context);

// Forward response headers
if (isset($http_response_header)) {
    foreach($http_response_header as $header) {
        if (strpos($header, 'HTTP/') !== 0) {
            header($header);
        }
    }
}

echo $response;
?>
EOF

chown -R vivassh:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.com/

# 6. Test domain access
echo "5. Testing domain access..."
curl -I http://opt.vivaindia.com/ | head -3 || echo "Domain not accessible yet"

echo ""
echo "=== CONFIGURATION COMPLETE ==="
echo "✅ Production server: PID $PROD_PID on port 8080"
echo "✅ Fallback PHP proxy: /var/www/vhosts/vivaindia.com/opt.vivaindia.com/httpdocs/"
echo ""
echo "For Plesk nginx configuration, use ONLY these directives:"
echo ""
cat << 'NGINX_EOF'
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /install {
    proxy_pass http://127.0.0.1:8080/install;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
NGINX_EOF

echo ""
echo "🌐 Access URLs after configuration:"
echo "   http://opt.vivaindia.com - OptiStore Pro main application"
echo "   http://opt.vivaindia.com/install - Database setup page"
echo "   http://opt.vivaindia.com/api/dashboard - API endpoints"