#!/bin/bash
# Direct Commands for Hostinger VPS Setup
# Copy and paste these commands one by one into your SSH session

echo "Starting OptiStore Pro setup on Hostinger VPS..."

# Phase 1: System Update
echo "Updating system..."
dnf update -y
dnf install -y curl wget git unzip tar postgresql

# Phase 2: Install Node.js
echo "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Phase 3: Install PM2
echo "Installing PM2..."
npm install -g pm2

# Phase 4: Create directories
echo "Creating directories..."
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
mkdir -p /var/backups/optistore
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app

# Phase 5: Test database
echo "Testing database connection..."
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'Database OK', version();"

# Phase 6: Create environment file
echo "Creating environment configuration..."
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=OptiStore-Pro-Session-Secret-2025-VivaindiaMedical-Ultra-Secure-Key
EOF

# Phase 7: Create PM2 config
echo "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
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

# Phase 8: Create logs directory
mkdir -p logs

# Phase 9: Create backup script
echo "Setting up backup system..."
cat > /root/backup-optistore.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/optistore"
export PGPASSWORD="Ra4#PdaqW0c^pa8c"

echo "Creating backup: optistore_$DATE.sql"
pg_dump -h localhost -p 5432 -U ledbpt_opt ieopt > $BACKUP_DIR/optistore_$DATE.sql

if [ $? -eq 0 ]; then
    gzip $BACKUP_DIR/optistore_$DATE.sql
    echo "Backup completed: optistore_$DATE.sql.gz"
    find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete
else
    echo "Backup failed"
fi
EOF

chmod +x /root/backup-optistore.sh

# Phase 10: Create management script
echo "Creating management tools..."
cat > /root/manage-optistore.sh << 'EOF'
#!/bin/bash
APP_DIR="/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"

case "$1" in
    "status") pm2 status ;;
    "logs") pm2 logs optistore-pro --lines 50 ;;
    "restart") pm2 restart optistore-pro ;;
    "start") cd $APP_DIR && pm2 start ecosystem.config.js --env production ;;
    "stop") pm2 stop optistore-pro ;;
    "build") cd $APP_DIR && npm run build ;;
    "install") cd $APP_DIR && npm install ;;
    "deploy") 
        cd $APP_DIR
        npm install && npm run build
        pm2 restart optistore-pro 2>/dev/null || pm2 start ecosystem.config.js --env production
        ;;
    "backup") /root/backup-optistore.sh ;;
    "db") 
        export PGPASSWORD="Ra4#PdaqW0c^pa8c"
        psql -h localhost -p 5432 -U ledbpt_opt -d ieopt
        ;;
    "db-import")
        if [ -z "$2" ]; then
            echo "Usage: $0 db-import <sql-file>"
            exit 1
        fi
        export PGPASSWORD="Ra4#PdaqW0c^pa8c"
        psql -h localhost -p 5432 -U ledbpt_opt -d ieopt < "$2"
        ;;
    "health")
        echo "=== OptiStore Pro Health Check ==="
        echo "1. PM2 Status:" && pm2 list
        echo "2. Database:" 
        export PGPASSWORD="Ra4#PdaqW0c^pa8c"
        psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'OK' as status;" 2>/dev/null || echo "DB Error"
        echo "3. App Response:"
        curl -s -o /dev/null -w "Status: %{http_code}\n" https://opt.vivaindia.com 2>/dev/null || echo "Not responding"
        ;;
    *) 
        echo "Commands: status|logs|restart|start|stop|build|install|deploy|backup|db|db-import|health"
        ;;
esac
EOF

chmod +x /root/manage-optistore.sh

# Phase 11: Configure firewall
echo "Configuring firewall..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    echo "Firewall configured"
fi

# Phase 12: Schedule backups
echo "Scheduling backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-optistore.sh") | crontab -

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Application directory: /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app"
echo ""
echo "Next steps:"
echo "1. Upload your OptiStore Pro files to the app directory"
echo "2. Import database: /root/manage-optistore.sh db-import your_backup.sql"
echo "3. Deploy: /root/manage-optistore.sh deploy" 
echo "4. Configure Plesk proxy to port 5000"
echo "5. Enable SSL in Plesk"
echo ""
echo "Management commands: /root/manage-optistore.sh [command]"
echo "Commands: status|logs|restart|deploy|health|backup"