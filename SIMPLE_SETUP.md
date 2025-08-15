# Simple Production Setup Commands

Your website opt.vivaindia.com is not working because the application stopped running. Here are the exact commands to fix it:

## Copy This Command Block:

```bash
ssh root@5.181.218.15
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
pm2 start ecosystem.config.js
pm2 status
curl http://localhost:8080/api/stores
```

## Expected Output:
- PM2 should show your app as "online"  
- curl should return JSON data with your stores
- Your website https://opt.vivaindia.com should work

## If Still Not Working:
Try this instead:
```bash
ssh root@5.181.218.15
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
pm2 delete all
pm2 start ecosystem.config.js
```

That's it! Your medical practice management system should be accessible again.