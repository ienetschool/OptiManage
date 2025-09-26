#!/bin/bash

# Production Deployment Script for OptiPro
# Server: 5.181.218.15
# Domain: https://Ieoptipro.ienet.online/
# Database: MariaDB (opticpro)

echo "🚀 Starting OptiPro Production Deployment"
echo "Server: 5.181.218.15"
echo "Domain: https://Ieoptipro.ienet.online/"
echo "Database: MariaDB (opticpro)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create production environment file
echo "📝 Creating production environment file..."
cp .env.production .env

if [ $? -eq 0 ]; then
    print_status "Environment file created"
else
    print_error "Failed to create environment file"
    exit 1
fi

# Check if required files exist
echo "📋 Checking required files..."
required_files=("package.json" "server/index.ts" "install.html")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file found"
    else
        print_error "$file missing"
        exit 1
    fi
done

# Install all dependencies (needed for build)
echo "📦 Installing all dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Clean up dev dependencies for production package
echo "🧹 Cleaning up dev dependencies for production..."
npm prune --production

if [ $? -eq 0 ]; then
    print_status "Dev dependencies cleaned up"
else
    print_warning "Failed to clean up dev dependencies - continuing"
fi

# Test database connection (MariaDB)
echo "🔍 Testing MariaDB connection..."
if command -v mysql &> /dev/null; then
    mysql -h 5.181.218.15 -P 3306 -u ledbpt_optie -pg79h94LAP -D opticpro -e "SELECT VERSION();" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_status "MariaDB connection successful"
    else
        print_warning "MariaDB connection test failed - continuing with deployment"
    fi
else
    print_warning "mysql client not found - skipping database test"
fi

# Set file permissions
echo "🔐 Setting file permissions..."
chmod 755 server/ 2>/dev/null || true
chmod 644 *.js *.json *.md 2>/dev/null || true
chmod 600 .env 2>/dev/null || true
chmod +x *.sh 2>/dev/null || true

print_status "File permissions set"

# Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DATE=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="optipro_deploy_${DEPLOY_DATE}.tar.gz"

# Exclude development files and node_modules
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.development' \
    -czf "$DEPLOY_PACKAGE" .

if [ $? -eq 0 ]; then
    print_status "Deployment package created: $DEPLOY_PACKAGE"
else
    print_error "Failed to create deployment package"
    exit 1
fi

# Create server deployment instructions
echo "📋 Creating server deployment instructions..."
cat > server_deploy_instructions.txt << EOL
=== OptiPro Server Deployment Instructions ===

Server Details:
- IP: 5.181.218.15
- User: root
- Password: XG0Z43@nH5Hz.T
- Deploy Path: /var/www/vhosts/vivaindia.com/ieoptic.ienet.online

Deployment Steps:

1. Upload the deployment package to server:
   scp $DEPLOY_PACKAGE root@5.181.218.15:/var/www/vhosts/vivaindia.com/ieoptic.ienet.online/

2. SSH into the server:
   ssh root@5.181.218.15

3. Navigate to deployment directory:
   cd /var/www/vhosts/vivaindia.com/ieoptic.ienet.online

4. Extract the deployment package:
   tar -xzf $DEPLOY_PACKAGE

5. Install Node.js dependencies:
   npm install --production

6. Start the application:
   # Option 1: Direct start
   npm start
   
   # Option 2: With PM2 (recommended)
   npm install -g pm2
   pm2 start server/index.ts --name "optipro"
   pm2 startup
   pm2 save

7. Configure web server (Apache/Nginx) to proxy to port 5000

8. Access the application:
   https://Ieoptipro.ienet.online/

9. Complete installation wizard:
   https://Ieoptipro.ienet.online/install.html

Database Configuration:
- Host: 5.181.218.15:3306
- Database: opticpro
- Username: ledbpt_optie
- Password: g79h94LAP

EOL

print_status "Server deployment instructions created: server_deploy_instructions.txt"

# Create backup script for MariaDB
echo "💾 Creating MariaDB backup script..."
cat > backup_mariadb.sh << 'EOL'
#!/bin/bash
# MariaDB backup script for OptiPro
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating MariaDB backup..."
mysqldump -h 5.181.218.15 -P 3306 -u ledbpt_optie -pg79h94LAP opticpro > "$BACKUP_DIR/opticpro_backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: $BACKUP_DIR/opticpro_backup_$DATE.sql"
else
    echo "❌ Database backup failed"
fi
EOL

chmod +x backup_mariadb.sh
print_status "MariaDB backup script created (backup_mariadb.sh)"

echo ""
echo "🎉 OptiPro Production Deployment Package Ready!"
echo ""
print_info "📦 Deployment Package: $DEPLOY_PACKAGE"
print_info "📋 Instructions: server_deploy_instructions.txt"
print_info "🌐 Target Domain: https://Ieoptipro.ienet.online/"
print_info "🗄️  Database: MariaDB (opticpro)"
print_info "📧 Admin Email: admin@ieoptipro.ienet.online"
echo ""
echo "🚀 Next Steps:"
echo "   1. Upload $DEPLOY_PACKAGE to your server"
echo "   2. Follow instructions in server_deploy_instructions.txt"
echo "   3. Configure web server proxy to port 5000"
echo "   4. Access https://Ieoptipro.ienet.online/install.html"
echo ""
print_status "Your optical practice management system is ready for deployment! 👓"