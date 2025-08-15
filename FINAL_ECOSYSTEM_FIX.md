# Final Ecosystem Fix - Correct Syntax

## Issue
The ecosystem.config.js file has syntax errors causing PM2 to fail.

## Run These Commands in SSH Terminal

```bash
# Navigate to app directory
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

# Stop all processes
pm2 stop all
pm2 delete all

# Create correct ecosystem file with proper syntax
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "optistore-main",
      script: "npx tsx server/index.ts",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        DATABASE_URL: "mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
      }
    }
  ]
};
EOF

# Verify the file is correct
cat ecosystem.config.js

# Start with the ecosystem file
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Check status and logs
pm2 status
pm2 logs optistore-main --lines 10

# Test if port 8080 is listening
netstat -tlnp | grep :8080
```

## Expected Result
- PM2 should show "online" status
- Logs should show "serving on port 8080" 
- netstat should show port 8080 listening
- opt.vivaindia.com:8080 should be accessible