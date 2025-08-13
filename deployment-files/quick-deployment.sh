#!/bin/bash
# OptiStore Pro - Quick Deployment Script for Hostinger VPS
# This script automates the entire deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="opt.vivaindia.com"
APP_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
DB_PASS="Ra4#PdaqW0c^pa8c"

echo -e "${BLUE}🚀 OptiStore Pro - Automated Deployment${NC}"
echo "================================================"
echo -e "Domain: ${YELLOW}https://$DOMAIN${NC}"
echo -e "App Directory: ${YELLOW}$APP_DIR${NC}"
echo -e "Database: ${YELLOW}$DB_NAME@$DB_HOST:$DB_PORT${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Phase 1: System Preparation
echo -e "\n${BLUE}Phase 1: System Preparation${NC}"
echo "----------------------------"

print_info "Updating AlmaLinux system..."
dnf update -y > /dev/null 2>&1
dnf install -y curl wget git unzip tar postgresql > /dev/null 2>&1
print_status "System updated and essential packages installed"

# Phase 2: Node.js Installation
echo -e "\n${BLUE}Phase 2: Node.js Installation${NC}"
echo "------------------------------"

print_info "Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
dnf install -y nodejs > /dev/null 2>&1

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js $NODE_VERSION and NPM $NPM_VERSION installed"

print_info "Installing PM2 process manager..."
npm install -g pm2 > /dev/null 2>&1
print_status "PM2 installed"

# Phase 3: Directory Setup
echo -e "\n${BLUE}Phase 3: Directory Setup${NC}"
echo "------------------------"

print_info "Creating application directories..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/logs"
mkdir -p "/var/backups/optistore"
print_status "Directories created: $APP_DIR"

# Phase 4: Database Connection Test
echo -e "\n${BLUE}Phase 4: Database Verification${NC}"
echo "------------------------------"

export PGPASSWORD="$DB_PASS"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    print_status "Database connection successful - $TABLE_COUNT tables found"
else
    print_error "Database connection failed. Please check credentials."
    exit 1
fi

# Phase 5: Configuration Files
echo -e "\n${BLUE}Phase 5: Configuration Files${NC}"
echo "-----------------------------"

print_info "Creating environment configuration..."
cat > "$APP_DIR/.env.production" << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@$DOMAIN
DOMAIN=https://$DOMAIN
SESSION_SECRET=OptiStore-$(openssl rand -hex 32)
EOF
print_status "Environment file created"

print_info "Creating PM2 configuration..."
cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    cwd: '/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '512M',
    restart_delay: 4000,
    watch: false
  }]
};
EOF
print_status "PM2 configuration created"

# Phase 6: Backup System
echo -e "\n${BLUE}Phase 6: Backup System Setup${NC}"
echo "-----------------------------"

print_info "Creating backup script..."
cat > /root/backup-optistore.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
BACKUP_DIR="/var/backups/optistore"

export PGPASSWORD="Ra4#PdaqW0c^pa8c"

echo "Creating backup: optistore_$DATE.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql

if [ $? -eq 0 ]; then
    gzip $BACKUP_DIR/optistore_$DATE.sql
    echo "✅ Backup completed: optistore_$DATE.sql.gz"
    find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete
else
    echo "❌ Backup failed"
fi
EOF

chmod +x /root/backup-optistore.sh
print_status "Backup script created"

print_info "Scheduling daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-optistore.sh") | crontab -
print_status "Daily backups scheduled at 2:00 AM"

# Phase 7: Management Tools
echo -e "\n${BLUE}Phase 7: Management Tools${NC}"
echo "--------------------------"

print_info "Creating management script..."
cat > /root/optistore-manage.sh << 'MGMT_EOF'
#!/bin/bash

APP_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
DB_PASS="Ra4#PdaqW0c^pa8c"

case "$1" in
    "status")
        echo "=== OptiStore Pro Status ==="
        pm2 status
        ;;
    "logs")
        echo "=== Application Logs ==="
        pm2 logs optistore-pro --lines 50
        ;;
    "restart")
        echo "=== Restarting OptiStore Pro ==="
        pm2 restart optistore-pro
        ;;
    "start")
        echo "=== Starting OptiStore Pro ==="
        cd $APP_DIR
        pm2 start ecosystem.config.js --env production
        ;;
    "stop")
        echo "=== Stopping OptiStore Pro ==="
        pm2 stop optistore-pro
        ;;
    "build")
        echo "=== Building Application ==="
        cd $APP_DIR
        npm run build
        ;;
    "install")
        echo "=== Installing Dependencies ==="
        cd $APP_DIR
        npm install
        ;;
    "deploy")
        echo "=== Full Deployment ==="
        cd $APP_DIR
        npm install
        npm run build
        pm2 restart optistore-pro 2>/dev/null || pm2 start ecosystem.config.js --env production
        ;;
    "backup")
        echo "=== Creating Database Backup ==="
        /root/backup-optistore.sh
        ;;
    "db")
        echo "=== Connecting to Database ==="
        export PGPASSWORD="$DB_PASS"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
        ;;
    "db-import")
        if [ -z "$2" ]; then
            echo "Usage: $0 db-import <sql-file>"
            exit 1
        fi
        echo "=== Importing Database ==="
        export PGPASSWORD="$DB_PASS"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$2"
        ;;
    "health")
        echo "=== OptiStore Pro Health Check ==="
        echo "Date: $(date)"
        echo ""
        echo "1. PM2 Status:"
        pm2 list
        echo ""
        echo "2. Database Connection:"
        export PGPASSWORD="$DB_PASS"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 'OK' as db_status, count(*) as tables FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "Database connection failed"
        echo ""
        echo "3. Application Response:"
        curl -s -o /dev/null -w "Response: %{http_code} - Time: %{time_total}s\n" https://opt.vivaindia.com 2>/dev/null || echo "Application not responding"
        echo ""
        echo "4. Disk Space:"
        df -h | head -2
        ;;
    *)
        echo "OptiStore Pro Management Commands:"
        echo "  $0 status     - Show PM2 status"
        echo "  $0 logs       - Show application logs"
        echo "  $0 restart    - Restart application"
        echo "  $0 start      - Start application"
        echo "  $0 stop       - Stop application"
        echo "  $0 build      - Build application"
        echo "  $0 install    - Install dependencies"
        echo "  $0 deploy     - Full deployment"
        echo "  $0 backup     - Create database backup"
        echo "  $0 db         - Connect to database"
        echo "  $0 db-import <file> - Import SQL file"
        echo "  $0 health     - Run health check"
        ;;
esac
MGMT_EOF

chmod +x /root/optistore-manage.sh
print_status "Management tools created"

# Phase 8: Security Configuration
echo -e "\n${BLUE}Phase 8: Security Configuration${NC}"
echo "-------------------------------"

print_info "Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http > /dev/null 2>&1
    firewall-cmd --permanent --add-service=https > /dev/null 2>&1
    firewall-cmd --permanent --add-port=5000/tcp > /dev/null 2>&1
    firewall-cmd --reload > /dev/null 2>&1
    print_status "Firewall configured"
else
    print_warning "Firewalld not running, skipping firewall configuration"
fi

# Phase 9: Test Backup
echo -e "\n${BLUE}Phase 9: Initial Backup${NC}"
echo "-----------------------"

print_info "Creating initial backup..."
/root/backup-optistore.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Initial backup created successfully"
else
    print_warning "Backup creation failed, but continuing deployment"
fi

# Final Summary
echo -e "\n${GREEN}🎉 Server Setup Complete!${NC}"
echo "=========================="
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Upload your OptiStore Pro files to: $APP_DIR"
echo "2. Import your database: /root/optistore-manage.sh db-import your_backup.sql"
echo "3. Deploy application: /root/optistore-manage.sh deploy"
echo "4. Configure Plesk Nginx proxy (see plesk-config.md)"
echo "5. Enable SSL certificate in Plesk"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo "   /root/optistore-manage.sh status     - Check application status"
echo "   /root/optistore-manage.sh deploy     - Full deployment"
echo "   /root/optistore-manage.sh health     - Health check"
echo "   /root/optistore-manage.sh logs       - View logs"
echo "   /root/optistore-manage.sh backup     - Create backup"
echo ""
echo -e "${YELLOW}📁 Important Paths:${NC}"
echo "   App Directory: $APP_DIR"
echo "   Environment: $APP_DIR/.env.production"
echo "   PM2 Config: $APP_DIR/ecosystem.config.js"
echo "   Logs: $APP_DIR/logs/"
echo "   Backups: /var/backups/optistore/"
echo ""
echo -e "${GREEN}✅ Your Hostinger VPS is ready for OptiStore Pro deployment!${NC}"
echo ""
echo -e "${BLUE}Need help? Refer to:${NC}"
echo "   - STEP_BY_STEP_SETUP.md for detailed instructions"
echo "   - plesk-config.md for Plesk configuration"
echo "   - Run: /root/optistore-manage.sh (without arguments) for command help"