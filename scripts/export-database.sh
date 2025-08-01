#!/bin/bash

# Export OptiStore Pro Database
# This script creates a complete backup of your PostgreSQL database

echo "🏥 OptiStore Pro Database Export Tool"
echo "======================================"

# Get current timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="database_backup_${TIMESTAMP}.sql"

echo "Creating database backup..."
echo "Backup file: $BACKUP_FILE"

# Use pg_dump to create a complete database backup
pg_dump $DATABASE_URL > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database backup created successfully!"
    echo "📁 File: $BACKUP_FILE"
    echo "📊 Size: $(du -h $BACKUP_FILE | cut -f1)"
    echo ""
    echo "To download this file:"
    echo "1. Right-click on '$BACKUP_FILE' in the file explorer"
    echo "2. Select 'Download'"
    echo ""
    echo "To restore on another system:"
    echo "psql your_database_url < $BACKUP_FILE"
else
    echo "❌ Database backup failed!"
    exit 1
fi