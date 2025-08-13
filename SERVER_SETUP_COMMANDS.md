# Direct Server Setup Commands - No File Upload Needed

Copy and paste these commands directly into your SSH session with your Hostinger server.

## Step 1: Connect to Your Server
```bash
ssh root@5.181.218.15
# Password: &8KXC4D+Ojfhuu0LSMhE
```

## Step 2: System Preparation (Copy-Paste All Together)
```bash
# Update system and install essentials
dnf update -y
dnf install -y curl wget git unzip tar postgresql

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Install PM2 globally
npm install -g pm2

echo "System preparation complete!"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 installed: $(pm2 --version)"
```

## Step 3: Create Application Structure
```bash
# Create directories
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
mkdir -p /var/backups/optistore

# Navigate to app directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app

# Create logs directory
mkdir -p logs

echo "Directory structure created at: $(pwd)"
```

## Step 4: Test Database Connection
```bash
# Test your existing PostgreSQL database
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'Database connection successful!' as status, version();"

# Check existing tables
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

echo "Database test completed!"
```

## Step 5: Create Environment Configuration
```bash
# Create production environment file
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app

cat > .env.production << 'ENV_EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=OptiStore-Pro-VivaindiaMedical-Session-Secret-2025-Ultra-Secure
ENV_EOF

echo "Environment file created successfully!"
```

## Step 6: Create PM2 Configuration
```bash
# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'PM2_EOF'
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
PM2_EOF

echo "PM2 configuration created!"
```

## Step 7: Create Management Script
```bash
# Create comprehensive management script
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
        echo "=== Restarting Application ==="
        pm2 restart optistore-pro
        ;;
    "start")
        echo "=== Starting Application ==="
        cd $APP_DIR
        pm2 start ecosystem.config.js --env production
        ;;
    "stop")
        echo "=== Stopping Application ==="
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
        npm install --production
        ;;
    "deploy")
        echo "=== Full Deployment ==="
        cd $APP_DIR
        npm install --production
        npm run build
        pm2 restart optistore-pro 2>/dev/null || pm2 start ecosystem.config.js --env production
        echo "Deployment complete!"
        ;;
    "backup")
        echo "=== Creating Database Backup ==="
        DATE=$(date +%Y%m%d_%H%M%S)
        BACKUP_DIR="/var/backups/optistore"
        export PGPASSWORD="$DB_PASS"
        pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql
        if [ $? -eq 0 ]; then
            gzip $BACKUP_DIR/optistore_$DATE.sql
            echo "Backup created: optistore_$DATE.sql.gz"
        else
            echo "Backup failed"
        fi
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
        pm2 list | grep optistore-pro
        echo ""
        echo "2. Database Connection:"
        export PGPASSWORD="$DB_PASS"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 'Database OK' as status, count(*) as tables FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "Database connection failed"
        echo ""
        echo "3. Application Response:"
        if command -v curl >/dev/null 2>&1; then
            curl -s -o /dev/null -w "HTTPS Status: %{http_code} - Response Time: %{time_total}s\n" https://opt.vivaindia.com 2>/dev/null || echo "Application not responding"
        else
            echo "Installing curl for health checks..."
            dnf install -y curl
        fi
        echo ""
        echo "4. Disk Usage:"
        df -h /var/www/vhosts/vivaindia.com/opt.vivaindia.com/
        ;;
    *)
        echo "OptiStore Pro Management Commands:"
        echo ""
        echo "  $0 status       - Show PM2 application status"
        echo "  $0 logs         - Show application logs"
        echo "  $0 restart      - Restart application"
        echo "  $0 start        - Start application"
        echo "  $0 stop         - Stop application"
        echo "  $0 build        - Build application"
        echo "  $0 install      - Install dependencies"
        echo "  $0 deploy       - Full deployment (install + build + restart)"
        echo "  $0 backup       - Create database backup"
        echo "  $0 db           - Connect to database shell"
        echo "  $0 db-import <file> - Import SQL database file"
        echo "  $0 health       - Complete health check"
        echo ""
        ;;
esac
MGMT_EOF

# Make management script executable
chmod +x /root/optistore-manage.sh

echo "Management script created: /root/optistore-manage.sh"
```

## Step 8: Configure Security
```bash
# Configure firewall if active
if systemctl is-active --quiet firewalld; then
    echo "Configuring firewall..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    echo "Firewall configured for HTTP, HTTPS, and port 5000"
else
    echo "Firewalld not active, skipping firewall configuration"
fi

# Set up daily database backups
echo "Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/optistore-manage.sh backup") | crontab -
echo "Daily backups scheduled at 2:00 AM"
```

## Step 9: Create Initial Backup
```bash
# Test backup system
echo "Creating initial backup..."
/root/optistore-manage.sh backup
```

## Step 10: Verify Setup
```bash
# Run health check
echo "Running system health check..."
/root/optistore-manage.sh health

echo ""
echo "=== Setup Summary ==="
echo "Application Directory: /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
echo "Environment File: .env.production (created)"
echo "PM2 Configuration: ecosystem.config.js (created)"
echo "Management Script: /root/optistore-manage.sh"
echo ""
echo "=== Next Steps ==="
echo "1. Upload your OptiStore Pro application files to:"
echo "   /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/"
echo ""
echo "2. Deploy the application:"
echo "   /root/optistore-manage.sh deploy"
echo ""
echo "3. Configure Plesk:"
echo "   - Set up Nginx proxy to port 5000"
echo "   - Enable SSL certificate"
echo "   - Configure domain settings"
echo ""
echo "4. Test your application:"
echo "   https://opt.vivaindia.com"
echo ""
echo "Management commands available:"
echo "   /root/optistore-manage.sh status"
echo "   /root/optistore-manage.sh health"
echo "   /root/optistore-manage.sh logs"
echo ""
echo "Server setup complete! Ready for OptiStore Pro deployment."
```

---

## After Running All Commands

Your server will be ready with:
- ✅ Node.js 18 and PM2 installed
- ✅ Application directories created
- ✅ Database connection verified
- ✅ Environment configuration ready
- ✅ PM2 process management configured
- ✅ Management tools installed
- ✅ Security and backups configured

**Next**: Upload your OptiStore Pro files and run `/root/optistore-manage.sh deploy`