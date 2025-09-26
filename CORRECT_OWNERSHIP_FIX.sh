#!/bin/bash

# CORRECT OWNERSHIP FIX - Restore proper Plesk user ownership
# This fixes the ownership back to the correct Plesk user: vivassh:psacln

cd /var/www/vhosts/vivaindia.com/

echo "=== FIXING OWNERSHIP TO CORRECT PLESK USER ==="
echo "Current ownership of opt.vivaindia.sql:"
ls -la | grep opt.vivaindia.sql

echo ""
echo "Restoring correct ownership: vivassh:psacln"
sudo chown -R vivassh:psacln opt.vivaindia.sql/

echo ""
echo "Setting proper permissions while keeping correct ownership..."
sudo find opt.vivaindia.sql/ -type d -exec chmod 755 {} \;
sudo find opt.vivaindia.sql/ -type f -exec chmod 644 {} \;

echo ""
echo "Making sure server directory is writable by the user..."
sudo chmod -R 775 opt.vivaindia.sql/server/
sudo chmod +x opt.vivaindia.sql/*.sh 2>/dev/null

echo ""
echo "Verification - ownership should now show vivassh:psacln:"
ls -la | grep opt.vivaindia.sql

echo ""
echo "Checking server directory permissions:"
ls -la opt.vivaindia.sql/ | grep server

echo ""
echo "✅ Ownership restored to correct Plesk user: vivassh:psacln"
echo "✅ Permissions set to allow proper operation"
echo ""
echo "Now the Git deployment should work correctly in Plesk"
echo "The folder will appear with correct user/group in Plesk file manager"