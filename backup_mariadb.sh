#!/bin/bash
# MariaDB backup script for OptiPro
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating MariaDB backup..."
mysqldump -h 5.181.218.15 -P 3306 -u ledbpt_optie -pg79h94LAP opticpro > "$BACKUP_DIR/opticpro_backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: $BACKUP_DIR/opticpro_backup_$DATE.sql"
else
    echo "❌ Database backup failed"
fi
