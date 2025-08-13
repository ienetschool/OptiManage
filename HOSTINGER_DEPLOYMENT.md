# OptiStore Pro - Hostinger VPS Deployment Guide
## AlmaLinux 9 + Plesk + PostgreSQL Setup

### Your Server Configuration
- **Server**: Hostinger VPS (5.181.218.15)
- **OS**: AlmaLinux 9 with Plesk
- **Domain**: https://opt.vivaindia.com
- **Database**: PostgreSQL (localhost:5432)
- **Path**: `/home/opt.vivaindia.new/`

## Step 1: Connect and Prepare

### 1.1 SSH Connection
```bash
ssh root@5.181.218.15
# Password: &8KXC4D+Ojfhuu0LSMhE
```

### 1.2 Update AlmaLinux System
```bash
# Update package manager
dnf update -y

# Install essential tools
dnf install -y curl wget git unzip tar
```

## Step 2: Install Node.js (Plesk Compatible)

### 2.1 Install Node.js via NodeSource
```bash
# Add NodeSource repository for AlmaLinux
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -

# Install Node.js
dnf install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.2 Install PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Verify PM2 installation
pm2 --version
```

## Step 3: Setup Application Directory

### 3.1 Navigate to Domain Directory
```bash
# Go to your domain directory
cd /var/www/vhosts/opt.vivaindia.com/httpdocs

# Create application structure
mkdir -p optistore-app
cd optistore-app
```

### 3.2 Upload Application Files
You can upload files via:

**Option A: Using Plesk File Manager**
1. Login to Plesk control panel
2. Go to Files → File Manager
3. Navigate to `httpdocs/optistore-app/`
4. Upload your application files

**Option B: Using SCP from your local machine**
```bash
# From your local machine, upload the files
scp -r /path/to/optistore-files/* root@5.181.218.15:/var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app/
```

**Option C: Git Clone (if you have repository)**
```bash
# Clone from repository
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app/
git clone https://github.com/yourusername/optistore-pro.git .
```

## Step 4: Database Setup

### 4.1 Test Existing Database Connection
```bash
# Test connection with your existing credentials
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT version();"
# Password: Ra4#PdaqW0c^pa8c
```

### 4.2 Import OptiStore Data
```bash
# Upload your database export file
# Copy optistore_production_complete.sql to server

# Import the data into your existing database
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt < optistore_production_complete.sql
# Password: Ra4#PdaqW0c^pa8c

# Verify import
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "\dt" | wc -l
```

## Step 5: Configure Application

### 5.1 Install Dependencies
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app/

# Install Node.js dependencies
npm install
```

### 5.2 Create Environment Configuration
```bash
# Create production environment file
nano .env.production
```

Add this configuration:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=your-very-long-random-secret-string-for-session-security
```

### 5.3 Create PM2 Configuration
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
    instances: 2,
    exec_mode: 'cluster',
    cwd: '/var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app',
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
```

## Step 6: Build and Start Application

### 6.1 Build Application
```bash
# Create logs directory
mkdir -p logs

# Build the application
npm run build

# Verify build completed
ls -la dist/
```

### 6.2 Start with PM2
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions provided
```

## Step 7: Configure Plesk for Node.js

### 7.1 Plesk Node.js Setup
1. **Login to Plesk Control Panel**
2. **Go to your domain** (opt.vivaindia.com)
3. **Navigate to**: Hosting & DNS → Web Server Settings
4. **Enable Node.js** if not already enabled

### 7.2 Configure Plesk Proxy (Method 1 - Recommended)
1. **Go to**: Apache & Nginx Settings
2. **Add to Nginx directives**:
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 7.3 Alternative: Direct Plesk Node.js (Method 2)
1. **Go to**: Node.js settings in Plesk
2. **Set Application Startup File**: `server/index.js`
3. **Set Application Root**: `/var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app`
4. **Enable the application**

## Step 8: SSL Certificate Setup

### 8.1 Enable SSL in Plesk
1. **Go to**: SSL/TLS Certificates
2. **Select**: Let's Encrypt
3. **Add domain**: opt.vivaindia.com and www.opt.vivaindia.com
4. **Enable**: "Secure the domain with Let's Encrypt"
5. **Click**: Get it free

### 8.2 Configure SSL Redirect
1. **Go to**: Hosting & DNS → Hosting Settings
2. **Enable**: "Permanent SEO-safe 301 redirect from HTTP to HTTPS"

## Step 9: Firewall Configuration (AlmaLinux)

### 9.1 Configure FirewallD
```bash
# Check firewall status
systemctl status firewalld

# Allow necessary ports
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=5000/tcp

# Reload firewall
firewall-cmd --reload

# Check configuration
firewall-cmd --list-all
```

## Step 10: Setup Backups

### 10.1 Create Backup Script
```bash
# Create backup directory
mkdir -p /var/backups/optistore

# Create backup script
nano /root/backup-optistore.sh
```

Add this content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
BACKUP_DIR="/var/backups/optistore"

# Set password for automatic backup
export PGPASSWORD="Ra4#PdaqW0c^pa8c"

# Create database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/optistore_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete

echo "Backup completed: optistore_$DATE.sql.gz"
```

### 10.2 Schedule Backups
```bash
# Make script executable
chmod +x /root/backup-optistore.sh

# Test backup
/root/backup-optistore.sh

# Schedule daily backups
crontab -e
# Add this line:
0 2 * * * /root/backup-optistore.sh
```

## Step 11: Testing and Verification

### 11.1 Test Application
```bash
# Check PM2 status
pm2 status

# Test local application
curl http://localhost:5000/api/auth/user

# Check logs
pm2 logs optistore-pro --lines 20
```

### 11.2 Test Domain Access
```bash
# Test domain response
curl -I https://opt.vivaindia.com

# Test SSL certificate
openssl s_client -connect opt.vivaindia.com:443 -servername opt.vivaindia.com
```

### 11.3 Database Verification
```bash
# Check tables count
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Check sample data
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT COUNT(*) FROM customers;"
```

## Step 12: Plesk Monitoring Setup

### 12.1 Enable Monitoring in Plesk
1. **Go to**: Server Management → Monitoring
2. **Enable**: Resource monitoring
3. **Set up**: Email notifications for issues

### 12.2 Create Health Check Script
```bash
# Create health check script
nano /root/health-check.sh
```

Add this content:
```bash
#!/bin/bash
echo "=== OptiStore Pro Health Check ===" > /tmp/health-report.txt
echo "Date: $(date)" >> /tmp/health-report.txt

# Check PM2 status
echo "PM2 Status:" >> /tmp/health-report.txt
pm2 list >> /tmp/health-report.txt

# Check database connection
echo "Database Test:" >> /tmp/health-report.txt
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'Database OK' as status;" >> /tmp/health-report.txt 2>&1

# Check application response
echo "Application Response:" >> /tmp/health-report.txt
curl -s -o /dev/null -w "Response: %{http_code} - Time: %{time_total}s" https://opt.vivaindia.com >> /tmp/health-report.txt

cat /tmp/health-report.txt
```

## Step 13: Final Configuration

### 13.1 Set Proper Permissions
```bash
# Set proper ownership for Plesk
chown -R root:psacln /var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app
chmod -R 755 /var/www/vhosts/opt.vivaindia.com/httpdocs/optistore-app
```

### 13.2 Restart Services
```bash
# Restart PM2 application
pm2 restart optistore-pro

# Restart Plesk services if needed
systemctl restart psa
```

## Success Checklist

Verify these items after deployment:
- [ ] Application accessible at https://opt.vivaindia.com
- [ ] SSL certificate working (green lock icon)
- [ ] Database contains 44+ tables with your data
- [ ] PM2 shows "online" status for optistore-pro
- [ ] Plesk shows Node.js application running
- [ ] All OptiStore features working (login, dashboard, patients)
- [ ] Daily backups scheduled and working
- [ ] Monitoring active in Plesk

## Troubleshooting for Plesk Environment

### Common Plesk Issues
```bash
# Check Plesk services
systemctl status psa

# Restart Plesk if needed
systemctl restart psa

# Check Plesk logs
tail -f /var/log/plesk/panel.log

# Check Node.js in Plesk
plesk bin site --info opt.vivaindia.com
```

### Permission Issues
```bash
# Fix Plesk permissions
plesk repair fs opt.vivaindia.com

# Reset file permissions
chmod -R 755 /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

Your OptiStore Pro system is now ready for deployment on your Hostinger VPS with Plesk!