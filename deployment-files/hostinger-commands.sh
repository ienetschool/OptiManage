#!/bin/bash
# OptiStore Pro - Hostinger VPS Deployment Script
# For AlmaLinux 9 with Plesk

echo "🚀 Starting OptiStore Pro deployment on Hostinger VPS..."

# Configuration
DOMAIN="opt.vivaindia.com"
APP_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
DB_PASS="Ra4#PdaqW0c^pa8c"

# Step 1: Update system
echo "📦 Updating AlmaLinux system..."
dnf update -y
dnf install -y curl wget git unzip tar

# Step 2: Install Node.js
echo "⚡ Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Step 3: Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2

# Step 4: Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

echo "📝 Application directory created at: $APP_DIR"

# Step 5: Test database connection
echo "🔐 Testing database connection..."
export PGPASSWORD="$DB_PASS"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your database credentials"
fi

# Step 6: Create environment template
echo "📝 Creating environment template..."
cat > $APP_DIR/.env.production << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@$DOMAIN
DOMAIN=https://$DOMAIN
SESSION_SECRET=CHANGE_THIS_TO_VERY_LONG_RANDOM_STRING
EOF

# Step 7: Create PM2 ecosystem
echo "⚙️ Creating PM2 configuration..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
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
    restart_delay: 4000
  }]
};
EOF

# Step 8: Setup backup directory and script
echo "💾 Setting up backup system..."
mkdir -p /var/backups/optistore

cat > /root/backup-optistore.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
BACKUP_DIR="/var/backups/optistore"

export PGPASSWORD="Ra4#PdaqW0c^pa8c"

# Create database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/optistore_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete

echo "Backup completed: optistore_$DATE.sql.gz"
EOF

chmod +x /root/backup-optistore.sh

# Step 9: Configure firewall
echo "🔥 Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    echo "✅ Firewall configured"
else
    echo "⚠️  Firewalld not running, skipping firewall configuration"
fi

# Step 10: Create health check script
echo "🏥 Creating health check script..."
cat > /root/health-check.sh << 'EOF'
#!/bin/bash
echo "=== OptiStore Pro Health Check ==="
echo "Date: $(date)"

echo "1. PM2 Status:"
pm2 list

echo "2. Database Connection:"
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'Database OK' as status;" 2>/dev/null || echo "Database connection failed"

echo "3. Application Response:"
curl -s -o /dev/null -w "Response: %{http_code} - Time: %{time_total}s\n" https://opt.vivaindia.com 2>/dev/null || echo "Application not responding"

echo "4. Disk Space:"
df -h | grep -E "(Filesystem|/dev/)"

echo "=== Health Check Complete ==="
EOF

chmod +x /root/health-check.sh

# Step 11: Create quick commands script
echo "📋 Creating quick commands reference..."
cat > /root/optistore-commands.sh << 'EOF'
#!/bin/bash

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
        echo "=== Restarting Application ==="
        pm2 restart optistore-pro
        ;;
    "health")
        echo "=== Running Health Check ==="
        /root/health-check.sh
        ;;
    "backup")
        echo "=== Creating Backup ==="
        /root/backup-optistore.sh
        ;;
    "db")
        echo "=== Connecting to Database ==="
        export PGPASSWORD="Ra4#PdaqW0c^pa8c"
        psql -h localhost -p 5432 -U ledbpt_opt -d ieopt
        ;;
    *)
        echo "OptiStore Pro Management Commands:"
        echo "  $0 status   - Show application status"
        echo "  $0 logs     - Show application logs"
        echo "  $0 restart  - Restart application"
        echo "  $0 health   - Run health check"
        echo "  $0 backup   - Create database backup"
        echo "  $0 db       - Connect to database"
        ;;
esac
EOF

chmod +x /root/optistore-commands.sh

echo ""
echo "✅ Server preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your OptiStore Pro application files to: $APP_DIR"
echo "2. Import your database: psql -h localhost -p 5432 -U ledbpt_opt -d ieopt < your_backup.sql"
echo "3. Install dependencies: cd $APP_DIR && npm install"
echo "4. Build application: npm run build"
echo "5. Start application: pm2 start ecosystem.config.js --env production"
echo "6. Configure Plesk proxy to port 5000"
echo "7. Enable SSL certificate in Plesk"
echo ""
echo "🛠️  Management commands available:"
echo "   /root/optistore-commands.sh status"
echo "   /root/optistore-commands.sh logs"
echo "   /root/optistore-commands.sh restart"
echo "   /root/optistore-commands.sh health"
echo "   /root/optistore-commands.sh backup"
echo ""
echo "🎉 Your Hostinger VPS is ready for OptiStore Pro deployment!"