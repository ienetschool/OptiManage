# OptiStore Pro - Deployment Package

## Your Files Overview

This deployment package contains everything needed to deploy OptiStore Pro on your Hostinger VPS:

### 📋 **Choose Your Deployment Method**

#### **Method 1: Automated (Recommended)**
Run the automated script that handles everything:
```bash
./quick-deployment.sh
```

#### **Method 2: Step-by-Step Manual**
Follow the detailed guide:
- Read: `STEP_BY_STEP_SETUP.md`

#### **Method 3: Corrected Setup**
Use the corrected setup script:
```bash
./corrected-setup.sh
```

---

## 📁 **File Descriptions**

### **Setup Scripts**
- `quick-deployment.sh` - **Complete automated deployment** (recommended)
- `corrected-setup.sh` - Server preparation with correct paths
- `hostinger-commands.sh` - Original deployment script

### **Configuration Guides**
- `STEP_BY_STEP_SETUP.md` - **Detailed step-by-step instructions**
- `plesk-config.md` - Plesk control panel configuration
- `quick-commands.md` - Daily management commands reference

### **Application Files**
- `ecosystem.config.js` - PM2 process manager configuration
- `nginx.conf` - Web server configuration
- `.env.production.template` - Environment variables template
- `optistore_production_complete.sql` - Your database export (87KB)

---

## 🚀 **Quick Start (5 Minutes)**

### **Step 1: Connect to Server**
```bash
ssh root@5.181.218.15
# Password: &8KXC4D+Ojfhuu0LSMhE
```

### **Step 2: Upload and Run**
```bash
# Upload quick-deployment.sh to your server
chmod +x quick-deployment.sh
./quick-deployment.sh
```

### **Step 3: Upload Your Application**
Upload your OptiStore Pro files to:
```
/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
```

### **Step 4: Deploy**
```bash
/root/optistore-manage.sh db-import optistore_production_complete.sql
/root/optistore-manage.sh deploy
```

### **Step 5: Configure Plesk**
- Follow instructions in `plesk-config.md`
- Set up Nginx proxy to port 5000
- Enable SSL certificate

---

## 🎯 **Your Target Configuration**

- **Domain**: https://opt.vivaindia.com
- **Server**: 5.181.218.15 (AlmaLinux 9 + Plesk)
- **Database**: PostgreSQL localhost:5432/ieopt (user: ledbpt_opt)
- **Application Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/`
- **Port**: 5000 (proxied through Nginx)

---

## 📊 **What You Get**

After deployment:
- **Complete medical practice management system**
- **44 database tables** with your business data
- **3 sample customers** (Rajesh, Priya, Amit)
- **2 patient records** with medical history
- **3 inventory products** (frames, lenses, solutions)
- **Professional SSL-secured domain**
- **Automated daily backups**
- **Production monitoring with PM2**
- **Management tools for maintenance**

---

## 🆘 **Need Help?**

### **For Detailed Instructions**
Read: `STEP_BY_STEP_SETUP.md` - Complete walkthrough with verification steps

### **For Plesk Configuration**
Read: `plesk-config.md` - Plesk control panel setup

### **For Daily Management**
Read: `quick-commands.md` - Command reference for maintenance

### **For Troubleshooting**
Each guide includes troubleshooting sections with common issues and solutions.

---

## ✅ **Success Indicators**

You'll know it's working when:
- OptiStore Pro loads at https://opt.vivaindia.com
- SSL certificate shows green lock
- Dashboard displays your 3 customers and 2 patients
- All features work (customer management, inventory, etc.)
- PM2 shows application running

---

## 🔧 **Management Commands (After Deployment)**

```bash
/root/optistore-manage.sh status    # Check application status
/root/optistore-manage.sh logs      # View application logs
/root/optistore-manage.sh restart   # Restart application
/root/optistore-manage.sh health    # Run health check
/root/optistore-manage.sh backup    # Create database backup
```

Your OptiStore Pro medical practice management system is ready for deployment!