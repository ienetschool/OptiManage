#!/bin/bash

# OptiStore Pro - Production Server Fix Script
# Run this on your production server: bash fix_production_server.sh

set -e  # Exit on any error

echo "🔧 OptiStore Pro Production Server Fix"
echo "========================================="

# Step 1: Find application directory
echo "🔍 Finding application directory..."

APP_DIR=""
POSSIBLE_DIRS=(
    "/var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
    "/var/www/vhosts/opt.vivaindia.com/httpdocs"
    "/var/www/vhosts/opt.vivaindia.com"
    "/home/optistore"
    "/opt/optistore"
)

for dir in "${POSSIBLE_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        APP_DIR="$dir"
        echo "✅ Found application at: $APP_DIR"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    echo "❌ Application directory not found. Searching..."
    APP_DIR=$(find /var/www -name "package.json" -type f 2>/dev/null | head -1 | xargs dirname)
    if [ -n "$APP_DIR" ]; then
        echo "✅ Found application at: $APP_DIR"
    else
        echo "❌ Could not find application directory. Please locate it manually."
        exit 1
    fi
fi

# Step 2: Navigate to application directory
echo "📁 Navigating to application directory..."
cd "$APP_DIR"
pwd

# Step 3: Set database environment
echo "🔧 Setting database environment..."
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

# Create/update .env file
if [ ! -f .env ]; then
    touch .env
fi

# Remove old DATABASE_URL entries and add new one
grep -v "DATABASE_URL" .env > .env.tmp 2>/dev/null || touch .env.tmp
echo "DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro" >> .env.tmp
mv .env.tmp .env
echo "✅ Updated .env file"

# Step 4: Fix database schema directly
echo "🔧 Fixing database schema..."
mysql -u ledbpt_optie -pg79h94LAP opticpro << 'EOF'
-- Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_notes TEXT;

-- Add missing columns to invoice_items table  
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);

SHOW TABLES;
EOF

echo "✅ Database schema updated"

# Step 5: Install/update dependencies
echo "📦 Updating dependencies..."
if [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

# Step 6: Build application
echo "🏗️ Building application..."
npm run build

# Step 7: Restart PM2 processes
echo "🔄 Restarting PM2 processes..."
pm2 restart all || pm2 reload all
pm2 restart optistore-pro 2>/dev/null || echo "optistore-pro process not found"
pm2 restart optistore 2>/dev/null || echo "optistore process not found"

# If no processes running, start new ones
if [ $(pm2 list | grep -c "online") -eq 0 ]; then
    echo "🚀 Starting new PM2 processes..."
    if [ -f ecosystem.config.js ]; then
        pm2 start ecosystem.config.js --env production
    else
        pm2 start npm --name "optistore-pro" -- start
    fi
    pm2 save
fi

# Step 8: Check status
echo "📊 Checking PM2 status..."
pm2 status

# Step 9: Test application
echo "🧪 Testing application..."
sleep 5  # Give the app time to start

echo "Testing port 8080..."
if netstat -tlnp | grep -q ":8080"; then
    echo "✅ Port 8080 is active"
    
    echo "Testing API endpoints..."
    if curl -s -f http://localhost:8080/api/dashboard > /dev/null; then
        echo "✅ Dashboard API working"
    else
        echo "❌ Dashboard API not responding"
    fi
    
    if curl -s -f http://localhost:8080/api/appointments > /dev/null; then
        echo "✅ Appointments API working"
    else
        echo "❌ Appointments API not responding"
    fi
else
    echo "❌ Port 8080 not active"
fi

# Step 10: Final status
echo ""
echo "🎉 Production server fix complete!"
echo "========================================="
echo "Your application should now be accessible at:"
echo "  • http://opt.vivaindia.com:8080 (direct)"
echo "  • http://opt.vivaindia.com (redirected)"
echo "  • http://opt.vivaindia.com/install (installation form)"
echo ""
echo "Recent logs:"
pm2 logs --lines 5 2>/dev/null || echo "No PM2 logs available"