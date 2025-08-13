#!/bin/bash

# OptiStore Pro Production Deployment Script
# Run this script on your production server

set -e

echo "🚀 Starting OptiStore Pro deployment..."

# Configuration
APP_NAME="optistore-pro"
APP_DIR="/var/www/$APP_NAME"
DB_NAME="optistore_prod"
DB_USER="optistore_admin"
BACKUP_DIR="/backups"

# Create application user
if ! id -u optistore > /dev/null 2>&1; then
    echo "📝 Creating application user..."
    sudo useradd -m -s /bin/bash optistore
    sudo usermod -aG sudo optistore
fi

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y curl gnupg2 software-properties-common apt-transport-https

# Install Node.js
echo "⚡ Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Create directories
echo "📁 Creating directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $APP_DIR/logs
sudo chown -R optistore:optistore $APP_DIR
sudo chown -R optistore:optistore $BACKUP_DIR

# Setup PostgreSQL
echo "🔐 Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# Configure PostgreSQL
echo "⚙️ Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Install Fail2Ban
echo "🛡️ Installing Fail2Ban..."
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create environment file template
echo "📝 Creating environment template..."
cat > $APP_DIR/.env.production << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:CHANGE_THIS_PASSWORD@localhost:5432/$DB_NAME
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@yourdomain.com
DOMAIN=https://yourdomain.com
SESSION_SECRET=CHANGE_THIS_TO_RANDOM_STRING
EOF

# Create backup script
echo "💾 Setting up backup script..."
cat > $BACKUP_DIR/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="optistore_prod"
DB_USER="optistore_admin"
BACKUP_DIR="/backups"

# Create database backup
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/optistore_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete

echo "Backup completed: optistore_$DATE.sql.gz"
EOF

chmod +x $BACKUP_DIR/backup.sh
sudo chown optistore:optistore $BACKUP_DIR/backup.sh

# Schedule backups
echo "⏰ Scheduling daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/backup.sh") | sudo -u optistore crontab -

# Create Nginx configuration
echo "🌐 Setting up Nginx..."
sudo cp deployment-files/nginx.conf /etc/nginx/sites-available/$APP_NAME
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Install SSL certificate (Let's Encrypt)
echo "🔒 Setting up SSL..."
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Base system setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your application files to $APP_DIR"
echo "2. Update the database password in $APP_DIR/.env.production"
echo "3. Import your database: psql -h localhost -U $DB_USER -d $DB_NAME < your_backup.sql"
echo "4. Install app dependencies: cd $APP_DIR && npm install"
echo "5. Build the application: npm run build"
echo "6. Get SSL certificate: sudo certbot --nginx -d yourdomain.com"
echo "7. Start the application: pm2 start ecosystem.config.js --env production"
echo "8. Save PM2 config: pm2 save && pm2 startup"
echo ""
echo "🎉 Your server is ready for OptiStore Pro deployment!"