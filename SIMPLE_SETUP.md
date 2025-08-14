# Simple Production Setup - Direct Access Method

## Current Status
- Application running perfectly on localhost:5000
- Plesk proxy configuration having conflicts
- Need alternative approach for production access

## Solution 1: Try Different Port Configuration
Update PM2 to run on port 80 (if available) or 8080:

```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
pm2 delete optistore-pro
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="8080" pm2 start /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/dist/index.js --name optistore-pro
pm2 save
```

Then test: http://opt.vivaindia.com:8080

## Solution 2: Check Firewall and Open Port
```bash
# Check if port 5000 is accessible externally
netstat -tlnp | grep :5000
firewall-cmd --list-ports
firewall-cmd --permanent --add-port=5000/tcp
firewall-cmd --reload
```

Then test: http://opt.vivaindia.com:5000

## Solution 3: Manual Apache Configuration File
Create direct Apache virtual host configuration instead of using Plesk interface:

```bash
cat > /etc/httpd/conf.d/optistore-proxy.conf << 'EOF'
<VirtualHost *:443>
    ServerName opt.vivaindia.com
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/
    
    SSLEngine on
    # SSL certificates managed by Plesk
</VirtualHost>
EOF

systemctl reload httpd
```

Try solutions in order - the simplest is testing port access first.