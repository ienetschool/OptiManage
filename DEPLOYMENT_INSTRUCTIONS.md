# OptiStore Pro - Self-Hosted Deployment Guide

## System Overview
OptiStore Pro is a complete medical practice management system built with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with 44 tables
- **Features**: Patient management, appointments, prescriptions, inventory, billing

## Current Status
✅ **Database**: 44 tables populated with sample data (3 customers, 2 patients, 3 products)
✅ **Backend APIs**: All endpoints functional (authentication, dashboard, inventory)
✅ **Frontend**: Complete React application with responsive design
✅ **Authentication**: Session-based auth system ready

## Prerequisites for Self-Hosting

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **Node.js**: v18+ (LTS recommended)
- **PostgreSQL**: v14+

### Domain Requirements
- SSL certificate (Let's Encrypt recommended)
- DNS A record pointing to your server
- Port 80/443 accessible

## Database Export & Setup

### 1. Export Current Database
```bash
# Export schema and data
npm run db:export

# Or manual export
pg_dump -h neon_host -U neondb_owner -d neondb > optistore_production.sql
```

### 2. Production Database Setup
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE optistore_prod;
CREATE USER optistore_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE optistore_prod TO optistore_admin;
\q

# Import data
psql -h localhost -U optistore_admin -d optistore_prod < optistore_production.sql
```

## Application Deployment

### 1. Server Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
npm install -g pm2

# Clone your application
git clone your_repo_url optistore-pro
cd optistore-pro
```

### 2. Environment Configuration
Create `.env.production`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://optistore_admin:your_secure_password@localhost:5432/optistore_prod
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@yourdomain.com
DOMAIN=https://yourdomain.com
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 3. Build & Deploy
```bash
# Install dependencies
npm install

# Build production version
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Nginx Configuration

### Install & Configure Nginx
```bash
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/optistore
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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

    # Static files
    location /assets {
        alias /path/to/optistore-pro/dist/public/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/optistore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## PM2 Ecosystem Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
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

## Database Backup Strategy
```bash
# Create backup script
nano /home/optistore/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U optistore_admin optistore_prod > /backups/optistore_$DATE.sql
find /backups -name "optistore_*.sql" -mtime +7 -delete

# Make executable and add to cron
chmod +x /home/optistore/backup.sh
crontab -e
# Add: 0 2 * * * /home/optistore/backup.sh
```

## Security Hardening
```bash
# Firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# PostgreSQL security
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost'
# Set: ssl = on

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Ensure: local all all md5
```

## Monitoring & Maintenance
```bash
# Install monitoring
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# View logs
pm2 logs optistore-pro
pm2 monit

# Health checks
pm2 show optistore-pro
```

## Production Checklist
- [ ] Database exported and imported successfully
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Nginx configuration active
- [ ] PM2 process running
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Domain DNS pointing to server
- [ ] Application accessible at https://yourdomain.com

## Support Files Ready for Export
- Complete source code
- Database schema with sample data
- Configuration files
- Deployment scripts
- Documentation

Your OptiStore Pro system is ready for self-hosted deployment with full control over your domain, server, and database infrastructure.