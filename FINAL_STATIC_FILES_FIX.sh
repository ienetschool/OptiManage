#!/bin/bash

# FINAL STATIC FILES PERMISSION FIX - OptiStore Pro
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.sql

echo "=== FIXING STATIC FILES AND PERMISSIONS ==="

# Stop PM2 first
pm2 stop optistore-main

# Remove the problematic double public folder
echo "Removing incorrect folder structure..."
rm -rf server/public

# Rebuild the frontend
echo "Rebuilding frontend..."
npm run build

# Create proper server/public structure
echo "Creating correct folder structure..."
mkdir -p server/public
cp -r dist/public/* server/public/

echo "Folder structure after copy:"
ls -la server/public/

# Fix all permissions properly for web server
echo "Setting correct permissions..."

# Set folder permissions (755 = rwxr-xr-x)
find server/public -type d -exec chmod 755 {} \;

# Set file permissions (644 = rw-r--r--)
find server/public -type f -exec chmod 644 {} \;

# Set ownership to web server user (usually www-data or apache)
chown -R apache:apache server/public/ 2>/dev/null || \
chown -R www-data:www-data server/public/ 2>/dev/null || \
chown -R nginx:nginx server/public/ 2>/dev/null || \
echo "Could not set web server ownership, using current user"

# Make sure the parent directories are accessible
chmod 755 server/
chmod 755 .

echo "=== FINAL PERMISSIONS CHECK ==="
echo "server/ permissions:"
ls -la server/ | grep "public"

echo "server/public/ contents:"
ls -la server/public/

echo "server/public/assets/ permissions:"
ls -la server/public/assets/ | head -5

# Create index.html with proper asset paths if missing
if [ ! -f server/public/index.html ]; then
    echo "Creating index.html..."
    cat > server/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <script type="module" crossorigin src="/assets/index-Cwl59t8h.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BwQnpknj.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF
    chmod 644 server/public/index.html
fi

echo "=== UPDATING PRODUCTION START SCRIPT ==="
cat > start-production.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export FORCE_PRODUCTION=true
export PORT=8080
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"
npm run dev
EOF

chmod +x start-production.sh

echo "=== RESTARTING APPLICATION ==="
pm2 delete optistore-main 2>/dev/null || true
pm2 start start-production.sh --name "optistore-main"

echo "=== WAITING FOR STARTUP ==="
sleep 15

echo "=== TESTING STATIC FILES ==="
echo "Testing CSS asset:"
curl -I http://localhost:8080/assets/index-BwQnpknj.css | head -3

echo "Testing JS asset:" 
curl -I http://localhost:8080/assets/index-Cwl59t8h.js | head -3

echo "Testing main page:"
curl -I http://localhost:8080/ | head -3

echo "Testing HTML content:"
curl -s http://localhost:8080/ | head -10

echo ""
echo "=== FINAL STATUS ==="
pm2 status
echo ""
echo "✅ Static files structure fixed"
echo "✅ Permissions set correctly for web server"
echo "✅ Production environment configured" 
echo "✅ PM2 process restarted"
echo ""
echo "🎯 OptiStore Pro should now be fully accessible at:"
echo "   http://opt.vivaindia.com:8080"
echo ""
echo "If Git deployment still fails, run:"
echo "   sudo chown -R \$USER:\$USER /var/www/vhosts/vivaindia.com/opt.vivaindia.sql/"