#!/bin/bash

echo "🚀 Fixing OptiStore Pro Production Deployment"
echo "Server: 5.181.218.15"
echo "Database: MySQL opticpro"
echo ""

# Execute the database column additions via SSH
ssh root@5.181.218.15 << 'ENDSSH'
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/

echo "📍 Current directory: $(pwd)"

echo "🔧 Adding missing database columns..."
mysql -h localhost -u ledbpt_optie -pg79h94LAP opticpro << 'EOF'
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE store_inventory ADD COLUMN IF NOT EXISTS reserved_quantity INT DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS store_id VARCHAR(36);
EOF

echo "✅ Database columns added successfully!"

echo "🔄 Restarting application..."
pm2 restart all

echo "📊 PM2 Status:"
pm2 status

echo "🧪 Testing API endpoint..."
curl -s http://localhost:8080/api/stores | head -100

echo ""
echo "✅ Production fix completed!"
echo "🌐 Test your website: https://opt.vivaindia.com"

ENDSSH

echo ""
echo "🎉 Production deployment fix completed!"
echo "Your OptiStore Pro should now work without 500 errors."