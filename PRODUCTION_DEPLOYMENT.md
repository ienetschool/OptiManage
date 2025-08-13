# Production Deployment Guide for opt.vivaindia.com

## System Configuration
- **Domain**: https://opt.vivaindia.com/
- **Database**: PostgreSQL
  - Host: localhost:5432
  - Database: ieopt
  - Username: ledbpt_opt
  - Password: RLR4!x53b!nlgbun
- **Environment**: Production
- **Admin Email**: admin@opt.vivaindia.com

## Installation Steps

### 1. Upload Files to Server
Upload all project files to your web server directory (typically `/home/username/public_html/` or `/var/www/html/`)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
DATABASE_URL=postgresql://ledbpt_opt:RLR4!x53b!nlgbun@localhost:5432/ieopt
NODE_ENV=production
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com/
PORT=5000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
Your PostgreSQL database is already configured. If you need to import data:
```bash
# Import the database backup
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt < database_backup_20250813_124947.sql
```

### 5. Build Application
```bash
npm run build
```

### 6. Database Migration
```bash
npm run db:push
```

### 7. Start Production Server
```bash
# For production deployment
npm start

# Or with PM2 for process management
pm2 start server/index.ts --name "optistore-pro"
pm2 startup
pm2 save
```

## Web Installation Wizard
Navigate to: https://opt.vivaindia.com/install.html

The 7-stage installation wizard is pre-configured with your settings:
1. **Application URL Settings** - Domain and admin configuration
2. **Database Setup** - PostgreSQL connection details
3. **Database Connection Testing** - Verify connectivity
4. **Database Import** - Import backup data
5. **Configuration Updates** - Environment setup
6. **NPM Commands** - Build and deployment
7. **Final Report** - Deployment summary

## SSL/HTTPS Setup
Ensure your domain has SSL configured. If using cPanel/shared hosting:
1. Enable SSL in cPanel
2. Force HTTPS redirects
3. Update domain references to use HTTPS

## File Permissions
Set appropriate permissions:
```bash
chmod 755 server/
chmod 644 *.js *.json *.md
chmod 600 .env
```

## Troubleshooting
- Check database connection: `psql -h localhost -U ledbpt_opt -d ieopt`
- View application logs: `pm2 logs optistore-pro`
- Restart application: `pm2 restart optistore-pro`

## Backup Strategy
Regular backups of:
1. Database: `pg_dump -h localhost -U ledbpt_opt ieopt > backup_$(date +%Y%m%d).sql`
2. Application files
3. Environment configuration

Your OptiStore Pro medical practice management system is ready for production deployment at opt.vivaindia.com!