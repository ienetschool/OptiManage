#!/bin/bash

# Export OptiStore Pro Database (Data Only)
# This script creates a backup with only the data (no schema)

echo "🏥 OptiStore Pro Data Export Tool"
echo "================================="

# Get current timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATA_FILE="database_data_${TIMESTAMP}.sql"

echo "Creating data-only backup..."
echo "Data file: $DATA_FILE"

# Use pg_dump with --data-only flag
pg_dump --data-only $DATABASE_URL > $DATA_FILE

if [ $? -eq 0 ]; then
    echo "✅ Data backup created successfully!"
    echo "📁 File: $DATA_FILE"
    echo "📊 Size: $(du -h $DATA_FILE | cut -f1)"
    echo ""
    echo "This file contains only INSERT statements for your data."
    echo ""
    echo "To download this file:"
    echo "1. Right-click on '$DATA_FILE' in the file explorer"
    echo "2. Select 'Download'"
else
    echo "❌ Data backup failed!"
    exit 1
fi