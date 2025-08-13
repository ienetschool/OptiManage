# Plesk Configuration for OptiStore Pro

## Domain Structure
- **Main Domain**: vivaindia.com  
- **Subdomain**: opt.vivaindia.com
- **File Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/`
- **Application Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/`

## Step 1: Plesk Domain Configuration

### 1.1 Access Plesk Panel
1. Go to your Plesk control panel (usually at https://your-server-ip:8443)
2. Login with your credentials

### 1.2 Navigate to Subdomain
1. Go to **Websites & Domains**
2. Find **vivaindia.com** domain
3. Click on **opt.vivaindia.com** subdomain

## Step 2: Node.js Application Setup

### 2.1 Enable Node.js (Method 1 - Direct)
1. In **opt.vivaindia.com** subdomain settings
2. Go to **Node.js** section
3. Enable Node.js
4. Configure:
   - **Node.js version**: 18.x
   - **Application root**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`
   - **Application startup file**: `server/index.js`
   - **Application URL**: Leave empty (will use subdomain)

### 2.2 Proxy Configuration (Method 2 - Recommended)
If Node.js direct hosting doesn't work, use proxy:

1. Go to **Apache & Nginx Settings**
2. Add to **Additional nginx directives**:

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
    
    # Handle Node.js static files
    proxy_set_header X-NginX-Proxy true;
    proxy_redirect off;
}

# Serve static assets directly
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://127.0.0.1:5000;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. Click **OK** to apply

## Step 3: SSL Certificate Setup

### 3.1 Install Let's Encrypt SSL
1. In **opt.vivaindia.com** subdomain
2. Go to **SSL/TLS Certificates**
3. Click **Install** next to **Let's Encrypt**
4. Select:
   - [x] Secure the domain **opt.vivaindia.com**
   - [x] Include www subdomain (if applicable)
5. Click **Get it free**

### 3.2 Force HTTPS Redirect
1. Go to **Hosting Settings** for opt.vivaindia.com
2. Enable **Permanent SEO-safe 301 redirect from HTTP to HTTPS**
3. Click **OK**

## Step 4: File Permissions

### 4.1 Set Correct Permissions
```bash
# SSH into your server and run:
chown -R root:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
chmod -R 755 /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
```

### 4.2 Fix Plesk Permissions
```bash
# Reset domain permissions if needed
plesk repair fs vivaindia.com
```

## Step 5: Environment Variables (If Using Node.js Direct)

If using Plesk's Node.js hosting directly:

1. Go to **Node.js** settings
2. Click **Environment Variables**
3. Add these variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=your-long-random-secret-string
```

## Step 6: Testing Configuration

### 6.1 Test Application
1. Start your application: `/root/optistore-manage.sh start`
2. Check PM2 status: `pm2 status`
3. Test locally: `curl http://localhost:5000`

### 6.2 Test Domain Access
1. Open browser: https://opt.vivaindia.com
2. Check SSL certificate (green lock icon)
3. Test login functionality

## Troubleshooting

### Issue: 502 Bad Gateway
**Solution**: Check if PM2 is running
```bash
pm2 status
/root/optistore-manage.sh start
```

### Issue: SSL Certificate Error
**Solution**: Regenerate certificate
1. Go to Plesk SSL settings
2. Delete existing certificate
3. Install new Let's Encrypt certificate

### Issue: File Permission Denied
**Solution**: Fix permissions
```bash
chown -R root:psacln /var/www/vhosts/vivaindia.com/opt.vivaindia.com/
chmod -R 755 /var/www/vhosts/vivaindia.com/opt.vivaindia.com/
plesk repair fs vivaindia.com
```

### Issue: Node.js Not Working in Plesk
**Solution**: Use proxy method instead
- Disable Node.js in Plesk
- Use PM2 to run application
- Configure Nginx proxy (see Method 2 above)

## Final Verification Checklist

- [ ] Application files in `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/`
- [ ] Database imported successfully
- [ ] PM2 application running (`pm2 status`)
- [ ] Nginx proxy configured in Plesk
- [ ] SSL certificate installed and working
- [ ] Domain accessible at https://opt.vivaindia.com
- [ ] OptiStore Pro login page loads
- [ ] Dashboard shows your data (patients, customers, etc.)

Your OptiStore Pro is now properly configured in Plesk!