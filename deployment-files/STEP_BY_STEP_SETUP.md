# OptiStore Pro - Complete Step-by-Step Setup Guide
## Hostinger VPS (AlmaLinux 9 + Plesk) Configuration

### Your Server Details
- **Server IP**: 5.181.218.15
- **OS**: AlmaLinux 9 with Plesk
- **Domain**: https://opt.vivaindia.com
- **File Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/`
- **Database**: PostgreSQL (localhost:5432/ieopt, user: ledbpt_opt)

---

## Phase 1: Server Access and Preparation

### Step 1.1: SSH Connection
```bash
ssh root@5.181.218.15
```
**Password**: `&8KXC4D+Ojfhuu0LSMhE`

**Expected Result**: You should see the AlmaLinux command prompt

### Step 1.2: System Update
```bash
dnf update -y
dnf install -y curl wget git unzip tar postgresql
```
**What this does**: Updates AlmaLinux and installs essential tools
**Time**: 3-5 minutes

### Step 1.3: Verify Database Connection
```bash
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT version();"
```
**Expected Result**: Should show PostgreSQL version information
**If it fails**: Check if PostgreSQL service is running with `systemctl status postgresql`

---

## Phase 2: Node.js and Application Setup

### Step 2.1: Install Node.js 18
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs
```
**Verify installation**:
```bash
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x or higher
```

### Step 2.2: Install PM2 Process Manager
```bash
npm install -g pm2
pm2 --version
```
**Expected Result**: PM2 version number displayed

### Step 2.3: Create Application Directory
```bash
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pwd
```
**Expected Result**: Should show `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`

---

## Phase 3: Upload Application Files

### Step 3.1: Upload Methods (Choose ONE)

**Option A: Using SCP (from your local machine)**
```bash
# Run this from YOUR LOCAL MACHINE (not the server)
scp -r /path/to/your/optistore-files/* root@5.181.218.15:/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
```

**Option B: Using Plesk File Manager**
1. Open Plesk control panel in browser
2. Go to **Files** → **File Manager**
3. Navigate to `opt.vivaindia.com` folder
4. Create `optistore-app` folder if not exists
5. Upload all your application files

**Option C: Using Git (if you have repository)**
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
git clone https://github.com/yourusername/optistore-pro.git .
```

### Step 3.2: Verify Files Uploaded
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
ls -la
```
**Expected Result**: Should see files like `package.json`, `server/`, `client/`, etc.

---

## Phase 4: Environment Configuration

### Step 4.1: Create Environment File
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
nano .env.production
```

**Copy and paste this content exactly**:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=OptiStore-Ultra-Secure-Session-Key-2025-VivaIndia-Medical-Practice
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4.2: Create PM2 Configuration
```bash
nano ecosystem.config.js
```

**Copy and paste this content exactly**:
```javascript
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
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4.3: Create Logs Directory
```bash
mkdir -p logs
```

---

## Phase 5: Database Import

### Step 5.1: Upload Database File
Upload `optistore_production_complete.sql` to the server using one of these methods:

**Method A: SCP (from local machine)**
```bash
scp optistore_production_complete.sql root@5.181.218.15:/tmp/
```

**Method B: Plesk File Manager**
1. Upload the SQL file to any folder
2. Note the file path

### Step 5.2: Import Database
```bash
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt < /tmp/optistore_production_complete.sql
```

### Step 5.3: Verify Database Import
```bash
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "\dt" | wc -l
```
**Expected Result**: Should show 44+ (indicating 44 tables imported)

```bash
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT COUNT(*) FROM customers;"
```
**Expected Result**: Should show `3` (your sample customers)

---

## Phase 6: Application Deployment

### Step 6.1: Install Dependencies
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
npm install
```
**Time**: 2-5 minutes
**Expected Result**: Should install all Node.js packages without errors

### Step 6.2: Build Application
```bash
npm run build
```
**Time**: 1-3 minutes
**Expected Result**: Should create `dist/` folder with built application

### Step 6.3: Verify Build
```bash
ls -la dist/
```
**Expected Result**: Should see built files like `index.html`, `assets/`, etc.

### Step 6.4: Start Application with PM2
```bash
pm2 start ecosystem.config.js --env production
```

### Step 6.5: Check Application Status
```bash
pm2 status
```
**Expected Result**: Should show `optistore-pro` with status `online`

### Step 6.6: Save PM2 Configuration
```bash
pm2 save
pm2 startup systemd
```
**Follow the instructions** that PM2 displays (usually copy-paste a command)

---

## Phase 7: Plesk Web Server Configuration

### Step 7.1: Access Plesk Panel
1. Open browser and go to: `https://5.181.218.15:8443`
2. Login with your Plesk credentials

### Step 7.2: Navigate to Your Domain
1. Click **Websites & Domains**
2. Find **vivaindia.com**
3. Click on **opt.vivaindia.com** subdomain

### Step 7.3: Configure Nginx Proxy
1. Click **Apache & Nginx Settings**
2. In the **Additional nginx directives** box, add this:

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

3. Click **OK** to apply changes

---

## Phase 8: SSL Certificate Setup

### Step 8.1: Install SSL Certificate
1. In **opt.vivaindia.com** domain settings
2. Click **SSL/TLS Certificates**
3. Click **Install** next to **Let's Encrypt**
4. Select **opt.vivaindia.com**
5. Click **Get it free**

### Step 8.2: Force HTTPS Redirect
1. Go to **Hosting Settings** for opt.vivaindia.com
2. Check **Permanent SEO-safe 301 redirect from HTTP to HTTPS**
3. Click **OK**

---

## Phase 9: Security Configuration

### Step 9.1: Configure Firewall
```bash
# Check if firewall is running
systemctl status firewalld

# Configure firewall rules
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=5000/tcp
firewall-cmd --reload

# Verify configuration
firewall-cmd --list-all
```

### Step 9.2: Set File Permissions
```bash
chown -R root:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
chmod -R 755 /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
```

---

## Phase 10: Backup System Setup

### Step 10.1: Create Backup Directory
```bash
mkdir -p /var/backups/optistore
```

### Step 10.2: Create Backup Script
```bash
nano /root/backup-optistore.sh
```

**Paste this content**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="ieopt"
DB_USER="ledbpt_opt"
BACKUP_DIR="/var/backups/optistore"

export PGPASSWORD="Ra4#PdaqW0c^pa8c"

echo "Creating backup: optistore_$DATE.sql"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_DIR/optistore_$DATE.sql

if [ $? -eq 0 ]; then
    gzip $BACKUP_DIR/optistore_$DATE.sql
    echo "✅ Backup completed: optistore_$DATE.sql.gz"
    
    # Remove backups older than 7 days
    find $BACKUP_DIR -name "optistore_*.sql.gz" -mtime +7 -delete
else
    echo "❌ Backup failed"
fi
```

### Step 10.3: Make Script Executable and Test
```bash
chmod +x /root/backup-optistore.sh
/root/backup-optistore.sh
```

### Step 10.4: Schedule Daily Backups
```bash
crontab -e
```
**Add this line**:
```
0 2 * * * /root/backup-optistore.sh
```

---

## Phase 11: Management Tools Setup

### Step 11.1: Create Management Script
```bash
nano /root/optistore-manage.sh
```

**Paste the management script** (see the complete script in corrected-setup.sh)

### Step 11.2: Make Script Executable
```bash
chmod +x /root/optistore-manage.sh
```

---

## Phase 12: Testing and Verification

### Step 12.1: Test Application Locally
```bash
curl http://localhost:5000/api/auth/user
```
**Expected Result**: Should return JSON response

### Step 12.2: Check PM2 Status
```bash
pm2 status
pm2 logs optistore-pro --lines 10
```
**Expected Result**: Application should be running without errors

### Step 12.3: Test Database Connection
```bash
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT 'Connection OK' as status, count(*) as tables FROM information_schema.tables WHERE table_schema = 'public';"
```

### Step 12.4: Test Domain Access
```bash
curl -I https://opt.vivaindia.com
```
**Expected Result**: Should return HTTP 200 OK

### Step 12.5: Browser Test
1. Open browser
2. Go to: `https://opt.vivaindia.com`
3. **Expected Result**: OptiStore Pro login page should load
4. Check for SSL certificate (green lock icon)

---

## Phase 13: Final Configuration

### Step 13.1: Restart All Services
```bash
pm2 restart optistore-pro
systemctl restart nginx
```

### Step 13.2: Run Health Check
```bash
/root/optistore-manage.sh health
```

### Step 13.3: Verify All Features
Test these in your browser:
- [ ] Login page loads
- [ ] Dashboard shows correct data (3 customers, 2 patients, etc.)
- [ ] Customer management works
- [ ] Patient records accessible
- [ ] Product inventory visible
- [ ] All navigation works properly

---

## Success Checklist

Mark each item as complete:
- [ ] SSH connection to server successful
- [ ] Node.js and PM2 installed
- [ ] Application files uploaded to correct directory
- [ ] Environment file created with correct database credentials  
- [ ] Database imported (44 tables, 3 customers confirmed)
- [ ] Application built successfully (dist/ folder created)
- [ ] PM2 shows application running (status: online)
- [ ] Plesk Nginx proxy configured for port 5000
- [ ] SSL certificate installed and working
- [ ] Firewall configured for HTTP/HTTPS
- [ ] Backup system scheduled
- [ ] Management tools installed
- [ ] Domain https://opt.vivaindia.com loads OptiStore Pro
- [ ] Login functionality working
- [ ] Dashboard displays your business data

---

## Troubleshooting Commands

**If application won't start:**
```bash
pm2 logs optistore-pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
npm run build
pm2 restart optistore-pro
```

**If database connection fails:**
```bash
systemctl status postgresql
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt
```

**If domain doesn't load:**
```bash
pm2 status
curl http://localhost:5000
# Check Plesk nginx configuration
```

**Emergency restart everything:**
```bash
pm2 restart all
systemctl restart nginx
systemctl restart postgresql
```

Your OptiStore Pro medical practice management system will be fully operational at https://opt.vivaindia.com following these steps!