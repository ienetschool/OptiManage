# 🔧 Simple SSH Commands to Fix Your Production Server

## Step 1: Connect to Your Server
```bash
ssh root@5.181.218.15
```

## Step 2: Navigate to Your Application
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

## Step 3: Check Current Status
```bash
# Check if the MySQL test endpoint exists
curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"

# If you get 404 error, the endpoint doesn't exist - continue to Step 4
# If you get JSON response, skip to Step 5
```

## Step 4: Upload New Routes File (if needed)
You need to upload the updated `server/routes.ts` file to your server. This file contains the MySQL connection endpoints.

**Option A: Use SCP to upload**
```bash
# From your local computer (not on the server):
scp server/routes.ts root@5.181.218.15:/var/www/vhosts/opt.vivaindia.com/httpdocs/server/routes.ts
```

**Option B: Edit directly on server**
```bash
# On the server, backup current file:
cp server/routes.ts server/routes.ts.backup

# Then edit the file to add the missing endpoints
# (This requires manual editing - Option A is easier)
```

## Step 5: Restart the Application
```bash
# Restart PM2 processes
pm2 restart all

# Check PM2 status
pm2 status
```

## Step 6: Test the Fix
```bash
# Test MySQL connection endpoint
curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"

# Should return something like:
# {"success":true,"message":"MySQL connection successful! Found 2 stores..."}
```

## Step 7: Test Web Interface
Open your browser and go to:
- https://opt.vivaindia.com/install

Click "Test Database Connection" - it should now work!

## If Still Having Issues
```bash
# Check application logs
pm2 logs

# Check if the application is running
pm2 status

# Check database connection manually
mysql -h localhost -u ledbpt_optie -p opticpro
# Enter password: g79h94LAP
```

The key issue is that your production server needs the updated `server/routes.ts` file that contains the MySQL connection endpoints.