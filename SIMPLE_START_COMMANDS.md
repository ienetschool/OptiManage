# Simple Start Commands - Copy and Paste

## Method 1: Single Command (Recommended)
```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 start ecosystem.config.js && curl http://localhost:8080/api/stores"
```

## Method 2: If Path is Different
```bash
ssh root@5.181.218.15 "find /var/www -name '*opt*' -type d && cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 start ecosystem.config.js"
```

## Method 3: Alternative Start
```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && pm2 start npm --name optistore -- start"
```

## Method 4: Manual Start
```bash
ssh root@5.181.218.15 "cd /var/www/vhosts/opt.vivaindia.com/httpdocs/ && nohup npm start > app.log 2>&1 &"
```

## Test Commands
```bash
# Check if app is running
curl https://opt.vivaindia.com

# Check PM2 status
ssh root@5.181.218.15 "pm2 status"

# Check logs
ssh root@5.181.218.15 "pm2 logs"
```

Use whichever method works for your server setup!