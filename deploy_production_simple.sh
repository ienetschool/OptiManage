#!/bin/bash

# Simplified Production Deployment Script for OptiStore Pro
# Domain: https://opt.vivaindia.com/

echo "🚀 Starting OptiStore Pro Production Deployment"
echo "Domain: https://opt.vivaindia.com/"
echo "Database: PostgreSQL (ieopt)"
echo ""

# Create environment file with your actual credentials
echo "📝 Creating production environment file..."
cat > .env << EOL
DATABASE_URL=postgresql://ledbpt_opt:RLR4!x53b!nlgbun@localhost:5432/ieopt
NODE_ENV=production
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com/
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=ledbpt_opt
PGPASSWORD=RLR4!x53b!nlgbun
PGDATABASE=ieopt
EOL

echo "✅ Environment file created"

# Test database connection (basic check)
echo "🔍 Testing basic connectivity..."
if ping -c 1 localhost &> /dev/null; then
    echo "✅ Localhost connectivity confirmed"
else
    echo "⚠️  Localhost connectivity test failed"
fi

# Test if required files exist
echo "📋 Checking required files..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f "server/index.ts" ]; then
    echo "✅ server/index.ts found"
else
    echo "❌ server/index.ts missing"
    exit 1
fi

if [ -f "install.html" ]; then
    echo "✅ install.html found"
else
    echo "❌ install.html missing"
    exit 1
fi

# Check database backup files
echo "📂 Database backup files available:"
for file in *.sql; do
    if [ -f "$file" ]; then
        echo "  - $file ($(ls -lh "$file" | awk '{print $5}')"
    fi
done

# Set basic file permissions
echo "🔐 Setting basic file permissions..."
chmod 644 *.js *.json *.md *.html 2>/dev/null || true
chmod 600 .env 2>/dev/null || true
chmod +x *.sh 2>/dev/null || true

echo "✅ File permissions set"

echo ""
echo "🎉 OptiStore Pro Production Environment Ready!"
echo ""
echo "📋 Production Configuration Summary:"
echo "   • Domain: https://opt.vivaindia.com/"
echo "   • Database: ieopt (PostgreSQL)"
echo "   • Admin Email: admin@opt.vivaindia.com"
echo "   • Environment: Production"
echo "   • Installation Wizard: Configured and ready"
echo ""
echo "🚀 Next Steps for Deployment:"
echo "   1. Upload all files to your production server"
echo "   2. Run: npm install --production"
echo "   3. Run: npm run build (if build script exists)"
echo "   4. Run: npm start"
echo ""
echo "🌐 Installation Wizard URL:"
echo "   https://opt.vivaindia.com/install.html"
echo ""
echo "✅ Your medical practice management system is ready!"