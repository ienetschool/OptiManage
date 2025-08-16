# Production Server Stability Issues

## Is this happening daily?

Based on your question about daily crashes, here's what likely happening:

### Possible Causes of Daily 502 Errors:
1. **Memory leaks**: Server runs out of memory and crashes
2. **Automatic server restarts**: Hosting provider restarts VPS daily
3. **Process management**: No auto-restart when server crashes
4. **Resource limits**: Plesk/hosting limits causing shutdowns
5. **Code errors**: Memory leaks in application code

### IMMEDIATE SOLUTION
First, let's get server running and see what error is in the logs:

```bash
# In your SSH terminal:
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
tail -50 production.log
```

### PERMANENT SOLUTION - Install PM2 for Auto-Restart
After we fix the immediate issue, install PM2 to prevent daily crashes:

```bash
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'optistore-production',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### MONITORING SOLUTION
```bash
# Check PM2 status
pm2 status
pm2 logs
pm2 monit
```

This will:
- Auto-restart if server crashes
- Restart if memory usage exceeds 1GB
- Survive server reboots
- Provide logging and monitoring

First, run the SSH commands above to see what error is preventing startup!