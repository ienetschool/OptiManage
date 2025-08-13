# How to Upload Deployment Files to Your Hostinger Server

## Method 1: Using SCP (Recommended)

### Step 1: Download Files from Replit
1. In Replit, go to the `deployment-files` folder
2. Download these files to your local machine:
   - `quick-deployment.sh`
   - `corrected-setup.sh`
   - `optistore_production_complete.sql`
   - `STEP_BY_STEP_SETUP.md`
   - `plesk-config.md`

### Step 2: Upload to Server
From your local machine terminal:

```bash
# Upload the main deployment script
scp quick-deployment.sh root@5.181.218.15:/root/

# Upload the database file
scp optistore_production_complete.sql root@5.181.218.15:/root/

# Upload other helpful files
scp corrected-setup.sh root@5.181.218.15:/root/
scp STEP_BY_STEP_SETUP.md root@5.181.218.15:/root/
scp plesk-config.md root@5.181.218.15:/root/
```

## Method 2: Manual Copy-Paste (Alternative)

Since the files aren't on your server yet, you can create them directly:

### Create the deployment script on your server:
```bash
# SSH into your server first
ssh root@5.181.218.15

# Create the quick deployment script
nano /root/quick-deployment.sh
```

Then copy and paste the entire content from the `quick-deployment.sh` file.

### Make it executable:
```bash
chmod +x /root/quick-deployment.sh
```

## Method 3: Using Plesk File Manager

1. Login to Plesk control panel at https://5.181.218.15:8443
2. Go to **Files** → **File Manager** 
3. Navigate to `/root/` directory
4. Upload the deployment files using the upload button
5. Set file permissions to executable (755) for .sh files

## After Upload: Run Deployment

Once files are uploaded, run:
```bash
ssh root@5.181.218.15
cd /root
ls -la  # Verify files are present
chmod +x quick-deployment.sh
./quick-deployment.sh
```

## Quick Manual Setup (No File Upload Needed)

If you prefer to skip file uploads, run these commands directly on your server:

```bash
# Update system
dnf update -y
dnf install -y curl wget git unzip tar postgresql

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# Install PM2
npm install -g pm2

# Create directories
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
mkdir -p /var/backups/optistore

# Test database connection
export PGPASSWORD="Ra4#PdaqW0c^pa8c"
psql -h localhost -p 5432 -U ledbpt_opt -d ieopt -c "SELECT version();"
```

This will get your server prepared for OptiStore Pro deployment.