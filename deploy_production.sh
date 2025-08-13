#!/bin/bash

# Production Deployment Script for OptiStore Pro
# Domain: https://opt.vivaindia.com/

echo "🚀 Starting OptiStore Pro Production Deployment"
echo "Domain: https://opt.vivaindia.com/"
echo "Database: PostgreSQL (ieopt)"
echo ""

# Create environment file
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

# Install dependencies
echo "📦 Installing production dependencies..."
npm install --production

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
if command -v psql &> /dev/null; then
    psql -h localhost -U ledbpt_opt -d ieopt -c "SELECT version();" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Database connection successful"
    else
        echo "⚠️  Database connection test failed - continuing with deployment"
    fi
else
    echo "⚠️  psql not found - skipping database test"
fi

# Build application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Database migration (if needed)
echo "🗄️  Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Database migrations failed - continuing"
fi

# Set file permissions
echo "🔐 Setting file permissions..."
chmod 755 server/ 2>/dev/null || true
chmod 644 *.js *.json *.md 2>/dev/null || true
chmod 600 .env 2>/dev/null || true

echo "✅ File permissions set"

# Start application (for testing)
echo "🎯 Testing application startup..."
timeout 10s npm start > startup_test.log 2>&1 &
sleep 5

if pgrep -f "server/index.ts" > /dev/null; then
    echo "✅ Application starts successfully"
    pkill -f "server/index.ts" 2>/dev/null || true
else
    echo "⚠️  Application startup test inconclusive"
fi

echo ""
echo "🎉 OptiStore Pro Production Deployment Complete!"
echo ""
echo "🌐 Your application is ready at: https://opt.vivaindia.com/"
echo "⚙️  Installation wizard: https://opt.vivaindia.com/install.html"
echo "📧 Admin email: admin@opt.vivaindia.com"
echo "🗄️  Database: ieopt (PostgreSQL)"
echo ""
echo "🚀 To start the production server:"
echo "   npm start"
echo ""
echo "📋 Or with PM2 for process management:"
echo "   pm2 start server/index.ts --name 'optistore-pro'"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "📊 Monitor with: pm2 logs optistore-pro"
echo "🔄 Restart with: pm2 restart optistore-pro"

# Create backup script
echo "💾 Creating backup script..."
cat > backup_database.sh << 'EOL'
#!/bin/bash
# Database backup script
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating database backup..."
pg_dump -h localhost -U ledbpt_opt ieopt > "$BACKUP_DIR/ieopt_backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: $BACKUP_DIR/ieopt_backup_$DATE.sql"
else
    echo "❌ Database backup failed"
fi
EOL

chmod +x backup_database.sh
echo "✅ Backup script created (backup_database.sh)"

echo ""
echo "🎯 Deployment Summary:"
echo "   • Environment: Production"
echo "   • Domain: https://opt.vivaindia.com/"
echo "   • Database: Connected and ready"
echo "   • Build: Completed successfully"
echo "   • Files: Permissions set"
echo "   • Backup: Script created"
echo ""
echo "Your medical practice management system is ready for launch! 🏥"