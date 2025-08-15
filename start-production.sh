#!/bin/bash

# Direct Node.js production start without tsx dependency
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== STARTING OPTISTORE PRO WITH NODE.JS DIRECTLY ==="

# Stop any existing processes
pm2 delete optistore-main 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Set environment variables
export NODE_ENV=production
export PORT=8080
export FORCE_PRODUCTION=true
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "Environment variables set:"
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "FORCE_PRODUCTION=$FORCE_PRODUCTION"

# Compile TypeScript to JavaScript using npx
echo "Compiling TypeScript..."
npx tsc server/index.ts --outDir ./compiled --module es2022 --target es2022 --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck

# If tsc fails, try alternative approach
if [ $? -ne 0 ]; then
    echo "TypeScript compilation failed, using direct node approach..."
    # Create a simple JS starter
    cat > server-start.js << 'EOF'
// Production server starter
import './server/index.ts';
EOF
    
    # Use node with experimental loader
    node --experimental-loader tsx/esm server-start.js &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
else
    echo "Starting compiled server..."
    node compiled/server/index.js &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
fi

# Wait a moment and test
sleep 5
echo "Testing server response..."
curl -I http://localhost:8080/ || echo "Server not responding yet"

echo "Server process: $SERVER_PID"
echo "Access your application at: http://opt.vivaindia.com:8080"