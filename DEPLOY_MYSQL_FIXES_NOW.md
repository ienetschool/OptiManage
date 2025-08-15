# IMMEDIATE MYSQL FIX DEPLOYMENT
## Copy & Paste These Commands to Fix Form Submissions

### Step 1: Upload Fixed MySQL Files
```bash
# Copy MySQL-compatible server files to production
scp server/medicalRoutes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/server/
scp server/storage.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/server/
scp server/hrRoutes.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/server/
scp shared/mysql-schema.ts vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt/shared/
```

### Step 2: Restart Production Server
```bash
ssh vivassh@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt
echo "Stopping old server..."
pkill -f 'tsx server/index.ts'
sleep 2
echo "Starting server with MySQL fixes..."
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &
echo "Server restarted! Checking process..."
ps aux | grep tsx | grep -v grep
echo "Checking server response..."
curl -s http://localhost:8080/api/dashboard | head -c 200
EOF
```

### Step 3: Test Patient Registration (Should Work Now)
```bash
curl -X POST https://opt.vivaindia.com/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"TestFixed","lastName":"MySQL","phone":"1234567890","email":"mysql.fixed@test.com"}'
```

### Alternative Single Command (All in One):
```bash
# Complete deployment in one command
ssh vivassh@5.181.218.15 << 'EOF'
cd /var/www/vhosts/vivaindia.com/opt
pkill -f 'tsx server/index.ts'
NODE_ENV=production PORT=8080 FORCE_PRODUCTION=true DATABASE_URL='mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro' nohup npx tsx server/index.ts > production.log 2>&1 &
ps aux | grep tsx
EOF
```

## What These Commands Do:
- ✅ Upload MySQL-compatible code (no PostgreSQL .returning() calls)
- ✅ Restart server with your MySQL database connection
- ✅ Test patient registration to confirm forms work
- ✅ Keep using YOUR MySQL: ledbpt_optie@localhost:3306/opticpro

## Expected Result:
Patient registration and all form submissions will work correctly with your MySQL database.