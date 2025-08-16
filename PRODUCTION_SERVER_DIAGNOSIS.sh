#!/bin/bash
echo "PRODUCTION SERVER DIAGNOSIS AND FIX"
echo "==================================="

# SSH into production server and run comprehensive diagnosis
cat > production_diagnosis.sh << 'DIAG_EOF'
#!/bin/bash
echo "SERVER DIAGNOSIS STARTING..."
echo "Current directory:"
pwd
echo ""

echo "Checking if project directory exists:"
ls -la /var/www/vhosts/vivaindia.com/
echo ""

echo "Checking project files:"
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql 2>/dev/null || {
    echo "ERROR: Project directory not found!"
    echo "Available directories:"
    ls -la /var/www/vhosts/vivaindia.com/
    exit 1
}

echo "Project directory contents:"
ls -la
echo ""

echo "Checking .env file:"
cat .env 2>/dev/null || echo "No .env file found"
echo ""

echo "Checking for tsx processes:"
ps aux | grep tsx | grep -v grep
echo ""

echo "Checking port 8080:"
netstat -tlnp | grep :8080 || echo "Port 8080 not listening"
echo ""

echo "Checking server logs:"
tail -20 production.log 2>/dev/null || echo "No production.log found"
echo ""

echo "Testing MySQL connection:"
mysql -h 5.181.218.15 -P 3306 -u ledbpt_optie -pg79h94LAP opticpro -e "SELECT COUNT(*) FROM patients;" 2>/dev/null || echo "MySQL connection failed"
echo ""

echo "FIXING PRODUCTION SERVER:"
echo "Setting correct database URL..."
echo 'DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro"' > .env

echo "Killing any existing processes..."
pkill -f 'tsx server/index.ts' 2>/dev/null
sudo fuser -k 8080/tcp 2>/dev/null
sleep 5

echo "Starting server with proper configuration..."
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro" NODE_ENV=production PORT=8080 tsx server/index.ts > production.log 2>&1 &

echo "Waiting for startup..."
sleep 20

echo "Verifying server is running:"
ps aux | grep tsx | grep -v grep
netstat -tlnp | grep :8080

echo "Testing local API:"
curl -s http://localhost:8080/api/dashboard | head -c 100

echo "DIAGNOSIS COMPLETE"
DIAG_EOF

echo "Created production diagnosis script"
echo "Run this on your server:"
echo ""
echo "ssh root@5.181.218.15"
echo "Password: &8KXC4D+Ojfhuu0LSMhE"
echo ""
echo "Then copy and paste the entire diagnosis script above"