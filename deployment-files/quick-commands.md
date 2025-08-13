# OptiStore Pro - Quick Command Reference

## Essential Commands for Your Deployment

### Server Connection
```bash
# Connect to your server
ssh optistore@your-server-ip
```

### Application Management
```bash
# Check application status
pm2 status

# View logs (last 50 lines)
pm2 logs optistore-pro --lines 50

# Restart application
pm2 restart optistore-pro

# Stop application
pm2 stop optistore-pro

# Start application
pm2 start ecosystem.config.js --env production
```

### Database Operations
```bash
# Connect to database
psql -h localhost -U optistore_admin -d optistore_prod

# List all tables
psql -h localhost -U optistore_admin -d optistore_prod -c "\dt"

# Check customer count
psql -h localhost -U optistore_admin -d optistore_prod -c "SELECT COUNT(*) FROM customers;"

# Manual backup
pg_dump -h localhost -U optistore_admin optistore_prod > backup_$(date +%Y%m%d).sql
```

### Web Server Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test renewal process
sudo certbot renew --dry-run
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep node

# Check network connections
sudo netstat -tlnp | grep :5000
```

### Backup Management
```bash
# Run manual backup
/home/optistore/backup.sh

# List recent backups
ls -la /backups/

# Check backup schedule
crontab -l
```

### Security Management
```bash
# Check firewall status
sudo ufw status

# View fail2ban status
sudo fail2ban-client status

# Check failed login attempts
sudo tail /var/log/auth.log
```

### Update Commands
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js packages
cd /var/www/optistore-pro
npm update

# Rebuild application after updates
npm run build
pm2 restart optistore-pro
```

### Troubleshooting Quick Fixes
```bash
# Fix common permission issues
sudo chown -R optistore:optistore /var/www/optistore-pro

# Clear PM2 logs
pm2 flush

# Restart all services
sudo systemctl restart postgresql nginx
pm2 restart optistore-pro

# Check all service status
sudo systemctl status postgresql nginx
pm2 status
```

### Domain and SSL Issues
```bash
# Check domain DNS resolution
nslookup yourdomain.com

# Test domain connectivity
curl -I https://yourdomain.com

# Check SSL certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Performance Monitoring
```bash
# Monitor PM2 processes
pm2 monit

# Check application response time
curl -w "%{time_total}\n" -o /dev/null -s https://yourdomain.com

# View system load
uptime

# Check memory usage by application
pm2 show optistore-pro
```

### Emergency Recovery
```bash
# Stop everything safely
pm2 stop all
sudo systemctl stop nginx

# Start everything back up
sudo systemctl start nginx
pm2 start ecosystem.config.js --env production

# Full system restart (if needed)
sudo reboot
```

## Quick Health Check Script
Create this file as `/home/optistore/health-check.sh`:

```bash
#!/bin/bash
echo "=== OptiStore Pro Health Check ==="
echo "Date: $(date)"
echo ""

echo "1. PM2 Status:"
pm2 list

echo ""
echo "2. Database Connection:"
psql -h localhost -U optistore_admin -d optistore_prod -c "SELECT COUNT(*) as total_customers FROM customers;" 2>/dev/null || echo "Database connection failed"

echo ""
echo "3. Web Server Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "4. SSL Certificate:"
sudo certbot certificates 2>/dev/null | grep -A 5 "yourdomain.com" || echo "No SSL certificate found"

echo ""
echo "5. Disk Space:"
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "6. Application Response:"
curl -s -o /dev/null -w "Response time: %{time_total}s - Status: %{http_code}\n" https://yourdomain.com || echo "Application not responding"

echo ""
echo "=== Health Check Complete ==="
```

Make it executable:
```bash
chmod +x /home/optistore/health-check.sh
```

Run health check:
```bash
/home/optistore/health-check.sh
```