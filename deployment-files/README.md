# OptiStore Pro - Self-Hosted Deployment Package

## Package Contents
This deployment package contains everything needed to deploy OptiStore Pro on your own infrastructure:

### 📁 Files Included
- `DEPLOYMENT_INSTRUCTIONS.md` - Complete deployment guide
- `deploy.sh` - Automated server setup script  
- `ecosystem.config.js` - PM2 process management configuration
- `nginx.conf` - Web server configuration with SSL
- `.env.production.template` - Environment variables template
- `optistore_production_complete.sql` - Complete database export
- Complete application source code (in parent directory)

### 🚀 Quick Start

1. **Prepare Your Server**
   - Ubuntu 20.04+ or CentOS 8+
   - 4GB RAM, 2+ CPU cores, 50GB storage
   - Root or sudo access

2. **Run Automated Setup**
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

3. **Configure Your Environment**
   ```bash
   # Copy and edit environment file
   cp .env.production.template /var/www/optistore-pro/.env.production
   nano /var/www/optistore-pro/.env.production
   ```

4. **Import Database**
   ```bash
   psql -h localhost -U optistore_admin -d optistore_prod < optistore_production_complete.sql
   ```

5. **Deploy Application**
   ```bash
   cd /var/www/optistore-pro
   npm install
   npm run build
   pm2 start ecosystem.config.js --env production
   ```

6. **Setup SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### 🔧 What Gets Deployed
- **Complete Medical Practice Management System**
- **44 Database Tables** with sample data
- **Patient Management** - 2 sample patients
- **Customer Database** - 3 sample customers  
- **Product Inventory** - 3 sample products
- **User Management** - 2 admin users
- **Store Configuration** - 1 main branch
- **Appointment Scheduling System**
- **Prescription Management**
- **Invoicing & Billing**
- **Financial Accounting System**
- **Staff Management**
- **Reports & Analytics**

### 🛡️ Security Features
- SSL/TLS encryption (Let's Encrypt)
- Firewall configuration (UFW)
- Fail2Ban intrusion prevention
- Database access controls
- Session security
- Security headers via Nginx

### 📊 Monitoring & Maintenance
- Automated daily database backups
- PM2 process monitoring
- Log rotation and management
- Health check endpoints
- Performance monitoring

### 💾 Backup Strategy
- Daily PostgreSQL dumps
- 7-day backup retention
- Compressed backup storage
- Automated cleanup

### 📋 Production Checklist
After deployment, verify these items:

- [ ] Application accessible at https://yourdomain.com
- [ ] Database contains 44 tables with data
- [ ] SSL certificate active and auto-renewing
- [ ] PM2 process running in cluster mode
- [ ] Nginx serving application correctly
- [ ] Daily backups scheduled and running
- [ ] Firewall rules active
- [ ] Admin user can login
- [ ] All features functional (patients, inventory, etc.)

### 🆘 Support & Troubleshooting

**Common Issues:**
- Database connection: Check credentials in .env.production
- SSL certificate: Ensure domain DNS points to server IP
- Application won't start: Check logs with `pm2 logs optistore-pro`
- 502 errors: Verify PM2 process is running on port 5000

**Log Locations:**
- Application logs: `/var/www/optistore-pro/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

**Useful Commands:**
```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs optistore-pro --lines 50

# Restart application
pm2 restart optistore-pro

# Check database connection
psql -h localhost -U optistore_admin -d optistore_prod -c "\dt"

# Test Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

### 🔄 Updates & Maintenance
To update your deployment:
1. Backup current database
2. Pull latest code changes
3. Run `npm install` and `npm run build`
4. Restart with `pm2 restart optistore-pro`

Your OptiStore Pro system is production-ready with enterprise-grade security, monitoring, and backup capabilities.