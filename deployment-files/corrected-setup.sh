#!/bin/bash
# OptiStore Pro - Corrected Hostinger Setup for vivaindia.com/opt.vivaindia.com

echo "🚀 OptiStore Pro - Corrected Setup for Hostinger VPS"
echo "Domain: opt.vivaindia.com"
echo "Path: /var/www/vhosts/vivaindia.com/opt.vivaindia.com/"
echo ""

# Configuration
DOMAIN="opt.vivaindia.com"
APP_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
MAIN_DOMAIN_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
DB_PASS="Ra4#PdaqW0c^pa8c"

echo "📋 Configuration:"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo "  Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Step 1: Update AlmaLinux
echo "📦 Updating AlmaLinux system..."
dnf update -y
dnf install -y curl wget git unzip tar postgresql

# Step 2: Install Node.js
echo "⚡ Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Step 3: Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2

# Step 4: Create directory structure
echo "📁 Setting up directories..."

# Check if the main domain directory exists
if [ ! -d "$MAIN_DOMAIN_DIR" ]; then
    echo "Creating main domain directory: $MAIN_DOMAIN_DIR"
    mkdir -p "$MAIN_DOMAIN_DIR"
fi

# Create application directory
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "✅ Application directory created: $APP_DIR"

# Step 5: Test database connection
echo "🔐 Testing database connection..."
export PGPASSWORD="$DB_PASS"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    # Show current table count
    TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo "Current tables in database: $TABLE_COUNT"
else
    echo "❌ Database connection failed"
    echo "Please verify your database is running and credentials are correct"
fi

# Step 6: Create environment file
echo "📝 Creating environment configuration..."
cat > "$APP_DIR/.env.production" << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@$DOMAIN
DOMAIN=https://$DOMAIN
SESSION_SECRET=OptiStore-$(openssl rand -hex 32)
EOF

echo "✅ Environment file created"

# Step 7: Create PM2 ecosystem
echo "⚙️ Creating PM2 configuration..."
cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    cwd: '$APP_DIR',
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

echo "✅ PM2 configuration created"

# Step 8: Create logs directory
mkdir -p "$APP_DIR/logs"

# Step 9: Setup backups
echo "💾 Setting up backup system..."
mkdir -p /var/backups/optistore

cat > /root/backup-optistore.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
DB_HOST="$DB_HOST"
DB_PORT="$DB_PORT"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
BACKUP_DIR="/var/backups/optistore"

export PGPASSWORD="$DB_PASS"

echo "Creating backup: optistore_\$DATE.sql"
pg_dump -h \$DB_HOST -p \$DB_PORT -U \$DB_USER \$DB_NAME > \$BACKUP_DIR/optistore_\$DATE.sql

if [ \$? -eq 0 ]; then
    gzip \$BACKUP_DIR/optistore_\$DATE.sql
    echo "✅ Backup completed: optistore_\$DATE.sql.gz"
    
    # Remove backups older than 7 days
    find \$BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned up"
else
    echo "❌ Backup failed"
fi
EOF

chmod +x /root/backup-optistore.sh

# Step 10: Create management script
echo "🛠️ Creating management tools..."
cat > /root/optistore-manage.sh << EOF
#!/bin/bash

APP_DIR="$APP_DIR"
DB_HOST="$DB_HOST"
DB_PORT="$DB_PORT"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_PASS="$DB_PASS"

case "\$1" in
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
        cd \$APP_DIR
        pm2 start ecosystem.config.js --env production
        ;;
    "stop")
        echo "=== Stopping OptiStore Pro ==="
        pm2 stop optistore-pro
        ;;
    "build")
        echo "=== Building Application ==="
        cd \$APP_DIR
        npm run build
        ;;
    "install")
        echo "=== Installing Dependencies ==="
        cd \$APP_DIR
        npm install
        ;;
    "deploy")
        echo "=== Full Deployment ==="
        cd \$APP_DIR
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
        export PGPASSWORD="\$DB_PASS"
        psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME
        ;;
    "db-import")
        if [ -z "\$2" ]; then
            echo "Usage: \$0 db-import <sql-file>"
            exit 1
        fi
        echo "=== Importing Database ==="
        export PGPASSWORD="\$DB_PASS"
        psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME < "\$2"
        ;;
    "db-test")
        echo "=== Testing Database Connection ==="
        export PGPASSWORD="\$DB_PASS"
        psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME -c "SELECT 'Database connection OK' as status, count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
        ;;
    "health")
        echo "=== OptiStore Pro Health Check ==="
        echo "Date: \$(date)"
        echo ""
        echo "1. PM2 Status:"
        pm2 list
        echo ""
        echo "2. Database Connection:"
        export PGPASSWORD="\$DB_PASS"
        psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME -c "SELECT 'OK' as db_status;" 2>/dev/null || echo "Database connection failed"
        echo ""
        echo "3. Application Response:"
        if command -v curl >/dev/null 2>&1; then
            curl -s -o /dev/null -w "Response: %{http_code} - Time: %{time_total}s\n" https://$DOMAIN 2>/dev/null || echo "Application not responding"
        else
            echo "curl not available, install with: dnf install curl"
        fi
        echo ""
        echo "4. Disk Space:"
        df -h | head -2
        ;;
    *)
        echo "OptiStore Pro Management Commands:"
        echo "  \$0 status     - Show PM2 status"
        echo "  \$0 logs       - Show application logs"
        echo "  \$0 restart    - Restart application"
        echo "  \$0 start      - Start application"
        echo "  \$0 stop       - Stop application"
        echo "  \$0 build      - Build application"
        echo "  \$0 install    - Install dependencies"
        echo "  \$0 deploy     - Full deployment (install + build + restart)"
        echo "  \$0 backup     - Create database backup"
        echo "  \$0 db         - Connect to database"
        echo "  \$0 db-import <file> - Import SQL file"
        echo "  \$0 db-test    - Test database connection"
        echo "  \$0 health     - Run health check"
        ;;
esac
EOF

chmod +x /root/optistore-manage.sh

# Step 11: Configure firewall
echo "🔥 Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    echo "✅ Firewall configured"
else
    echo "⚠️ Firewalld not running"
fi

# Step 12: Set up cron for backups
echo "⏰ Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-optistore.sh") | crontab -

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📁 Your application directory: $APP_DIR"
echo "📝 Environment file: $APP_DIR/.env.production"
echo "⚙️ PM2 config: $APP_DIR/ecosystem.config.js"
echo ""
echo "📋 Next Steps:"
echo "1. Upload your OptiStore Pro files to: $APP_DIR"
echo "2. Import database: /root/optistore-manage.sh db-import your_backup.sql"
echo "3. Deploy: /root/optistore-manage.sh deploy"
echo "4. Configure Plesk proxy to port 5000"
echo "5. Enable SSL in Plesk"
echo ""
echo "🛠️ Management Commands:"
echo "   /root/optistore-manage.sh status"
echo "   /root/optistore-manage.sh deploy"
echo "   /root/optistore-manage.sh health"
echo "   /root/optistore-manage.sh backup"
echo ""
echo "✅ Your server is ready for OptiStore Pro!"