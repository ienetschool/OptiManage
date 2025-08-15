# FINAL MYSQL PRODUCTION SETUP

## VERIFIED PRODUCTION DETAILS
- **Path:** /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
- **Database:** MySQL opticpro
- **Host:** localhost:3306 (MySQL server on 5.181.218.15)
- **User:** ledbpt_optie
- **Password:** g79h94LAP

## IMMEDIATE SERVER RESTART COMMAND
```bash
ssh vivassh@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
pkill -f 'tsx server/index.ts'
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &
sleep 5
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep :8080
tail -10 production.log
curl -s http://localhost:8080/api/dashboard | head -c 100
EOF
```

## WHAT THIS FIXES
- 502 Bad Gateway error (server will start on port 8080)
- Connects to your MySQL opticpro database
- Enables all medical practice management features
- Resolves form submission issues

## EXPECTED RESULT
- opt.vivaindia.com loads properly
- Patient registration works
- All medical management forms functional
- MySQL database integration complete