# OptiStore Pro - Complete Step-by-Step Deployment Guide

## Prerequisites Checklist
Before starting, ensure you have:
- [ ] A domain name (e.g., yourdomain.com)
- [ ] A VPS/server (Ubuntu 20.04+ recommended)
- [ ] Server root/sudo access
- [ ] Domain DNS pointed to your server IP

## Step 1: Server Preparation

### 1.1 Connect to Your Server
```bash
# SSH into your server
ssh root@your-server-ip
# OR if using a user account:
ssh your-username@your-server-ip
```

### 1.2 Update System
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip
```

### 1.3 Create Application User
```bash
# Create dedicated user for security
sudo useradd -m -s /bin/bash optistore
sudo usermod -aG sudo optistore

# Switch to the new user
sudo su - optistore
```

## Step 2: Install Required Software

### 2.1 Install Node.js (Version 18)
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 2.2 Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 2.3 Install Nginx
```bash
# Install Nginx web server
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 2.4 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

## Step 3: Setup Database

### 3.1 Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, run these commands:
CREATE DATABASE optistore_prod;
CREATE USER optistore_admin WITH ENCRYPTED PASSWORD 'YourSecurePassword123';
GRANT ALL PRIVILEGES ON DATABASE optistore_prod TO optistore_admin;
ALTER USER optistore_admin CREATEDB;
\q
```

### 3.2 Test Database Connection
```bash
# Test the connection
psql -h localhost -U optistore_admin -d optistore_prod -c "SELECT version();"
# Enter password when prompted: YourSecurePassword123
```

## Step 4: Download and Setup Application

### 4.1 Create Application Directory
```bash
# Create application directory
sudo mkdir -p /var/www/optistore-pro
sudo chown -R optistore:optistore /var/www/optistore-pro

# Switch to application directory
cd /var/www/optistore-pro
```

### 4.2 Upload Your Application Files
You have several options:

**Option A: If you have a Git repository**
```bash
# Clone from your repository
git clone https://github.com/yourusername/optistore-pro.git .
```

**Option B: Upload files manually**
```bash
# Use SCP to upload files from your local machine
# Run this from your local machine (not server):
scp -r /path/to/your/optistore-files/* optistore@your-server-ip:/var/www/optistore-pro/
```

**Option C: Download from Replit (if you've exported)**
```bash
# If you've created a zip file, download and extract
wget https://your-file-host.com/optistore-pro.zip
unzip optistore-pro.zip
```

### 4.3 Install Dependencies
```bash
# Make sure you're in the application directory
cd /var/www/optistore-pro

# Install Node.js dependencies
npm install

# Verify package.json exists and dependencies installed
ls -la node_modules/
```

## Step 5: Import Database

### 5.1 Upload Database File
```bash
# Copy your database export file to the server
# From your local machine:
scp deployment-files/optistore_production_complete.sql optistore@your-server-ip:/tmp/
```

### 5.2 Import Database
```bash
# Import the database
psql -h localhost -U optistore_admin -d optistore_prod < /tmp/optistore_production_complete.sql

# Verify import worked
psql -h localhost -U optistore_admin -d optistore_prod -c "\dt"
# Should show 44 tables

# Check sample data
psql -h localhost -U optistore_admin -d optistore_prod -c "SELECT COUNT(*) FROM customers;"
# Should return 3
```

## Step 6: Configure Environment

### 6.1 Create Environment File
```bash
# Create production environment file
cd /var/www/optistore-pro
nano .env.production
```

### 6.2 Add Environment Variables
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://optistore_admin:YourSecurePassword123@localhost:5432/optistore_prod
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@yourdomain.com
DOMAIN=https://yourdomain.com
SESSION_SECRET=your-long-random-secret-string-here-make-it-very-secure
```

Save and exit (Ctrl+X, Y, Enter)

### 6.3 Create PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## Step 7: Build and Start Application

### 7.1 Build Application
```bash
# Create logs directory
mkdir -p logs

# Build the application
npm run build

# Verify build completed
ls -la dist/
```

### 7.2 Start with PM2
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs optistore-pro

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

## Step 8: Configure Nginx

### 8.1 Create Nginx Configuration
```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/optistore
```

Add this configuration (replace yourdomain.com):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.2 Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/optistore /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 9: Setup SSL Certificate

### 9.1 Install Certbot
```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Get SSL Certificate
```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to share email with EFF
# - Select redirect option (recommended: 2)
```

### 9.3 Test Auto-Renewal
```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Setup automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 10: Setup Security

### 10.1 Configure Firewall
```bash
# Install and configure UFW firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Check status
sudo ufw status
```

### 10.2 Install Fail2Ban
```bash
# Install fail2ban for intrusion prevention
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Step 11: Setup Backups

### 11.1 Create Backup Script
```bash
# Create backup directory
sudo mkdir -p /backups
sudo chown optistore:optistore /backups

# Create backup script
nano /home/optistore/backup.sh
```

Add this content:
```bash
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
```

### 11.2 Schedule Backups
```bash
# Make script executable
chmod +x /home/optistore/backup.sh

# Test backup
/home/optistore/backup.sh

# Schedule daily backups
crontab -e
# Add this line:
0 2 * * * /home/optistore/backup.sh
```

## Step 12: Final Verification

### 12.1 Test Application
```bash
# Check if application is running
pm2 status

# Test local access
curl http://localhost:5000/api/auth/user

# Check logs for any errors
pm2 logs optistore-pro --lines 20
```

### 12.2 Test Domain Access
```bash
# Test your domain (replace with your domain)
curl https://yourdomain.com

# Check SSL certificate
curl -I https://yourdomain.com
```

### 12.3 Verify Database
```bash
# Check database tables
psql -h localhost -U optistore_admin -d optistore_prod -c "\dt" | wc -l
# Should show 44+ (including headers)

# Check sample data
psql -h localhost -U optistore_admin -d optistore_prod -c "SELECT name FROM customers LIMIT 3;"
```

## Step 13: Access Your Application

### 13.1 Admin Login
1. Open your browser and go to: `https://yourdomain.com`
2. You should see the OptiStore Pro login page
3. Use the admin credentials from your database

### 13.2 Verify Features
Test these key features:
- [ ] Dashboard loads with patient/customer counts
- [ ] Customer management works
- [ ] Patient records accessible
- [ ] Product inventory visible
- [ ] Appointment scheduling functions
- [ ] Reports generate correctly

## Troubleshooting

### Common Issues and Solutions

**Issue: Application won't start**
```bash
# Check logs
pm2 logs optistore-pro

# Check if port 5000 is available
sudo netstat -tlnp | grep :5000

# Restart application
pm2 restart optistore-pro
```

**Issue: Database connection fails**
```bash
# Test database connection
psql -h localhost -U optistore_admin -d optistore_prod

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env.production file
cat /var/www/optistore-pro/.env.production
```

**Issue: SSL certificate problems**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

**Issue: 502 Bad Gateway**
```bash
# Check if PM2 process is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart optistore-pro
sudo systemctl restart nginx
```

## Maintenance Commands

### Regular Maintenance
```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs optistore-pro

# Restart application
pm2 restart optistore-pro

# Check disk space
df -h

# Check recent backups
ls -la /backups/

# Update system packages
sudo apt update && sudo apt upgrade

# Check SSL certificate expiry
sudo certbot certificates
```

## Success Checklist

After completing all steps, verify:
- [ ] Application accessible at https://yourdomain.com
- [ ] SSL certificate active (green lock in browser)
- [ ] Database contains 44 tables with sample data
- [ ] PM2 shows "online" status for optistore-pro
- [ ] Nginx serving application without errors
- [ ] Firewall active with correct rules
- [ ] Daily backups scheduled and working
- [ ] All features functional (login, dashboard, patients, etc.)

Your OptiStore Pro medical practice management system is now live on your domain with complete control over your infrastructure!