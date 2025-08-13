# Start Application - Working Commands

## Current Issue
- PM2 shows no processes running
- curl connection refused on port 5000
- Application not starting despite commands

## Step-by-Step Solution

### 1. Check if dist/index.js exists
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
ls -la dist/
file dist/index.js
```

### 2. Test if the built file works manually
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" node dist/index.js
```
(This should start the server - press Ctrl+C to stop)

### 3. If manual start works, try PM2 again
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" pm2 start dist/index.js --name optistore-pro
```

### 4. Check PM2 daemon status
```bash
pm2 ping
pm2 status
```

### 5. Alternative: Try different approach
```bash
# Create a simple start script
echo '#!/bin/bash
export DATABASE_URL="postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt"
export NODE_ENV="production"
export PORT="5000"
node dist/index.js' > start.sh

chmod +x start.sh
pm2 start start.sh --name optistore-pro
```

### 6. Debug PM2 issues
```bash
pm2 logs
pm2 describe optistore-pro
```

The goal is to identify why PM2 isn't keeping the process running.