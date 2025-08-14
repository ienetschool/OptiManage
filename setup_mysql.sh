#!/bin/bash

# OptiStore Pro - MySQL Setup Script
# This script helps set up the MySQL database for production deployment

echo "🏥 OptiStore Pro - MySQL Database Setup"
echo "========================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set your MySQL connection string first:"
    echo "export DATABASE_URL='mysql://username:password@host:port/database'"
    exit 1
fi

echo "✅ DATABASE_URL is configured"
echo "Database: $DATABASE_URL"

# Push schema to database
echo ""
echo "📊 Pushing MySQL schema to database..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Schema migration completed successfully"
else
    echo "❌ Schema migration failed"
    exit 1
fi

# Ask if user wants to import sample data
echo ""
read -p "🗃️  Would you like to import sample medical practice data? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📥 Importing sample data..."
    
    # Extract connection details from DATABASE_URL
    # Format: mysql://username:password@host:port/database
    DB_URL_CLEAN=$(echo $DATABASE_URL | sed 's/mysql:\/\///')
    
    # Check if mysql client is available
    if command -v mysql &> /dev/null; then
        echo "Importing data using mysql client..."
        mysql --defaults-extra-file=<(echo -e "[client]\nuser=$(echo $DB_URL_CLEAN | cut -d':' -f1)\npassword=$(echo $DB_URL_CLEAN | cut -d'@' -f1 | cut -d':' -f2)\nhost=$(echo $DB_URL_CLEAN | cut -d'@' -f2 | cut -d':' -f1)\nport=$(echo $DB_URL_CLEAN | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)") $(echo $DB_URL_CLEAN | cut -d'/' -f2) < mysql_sample_data.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Sample data imported successfully"
        else
            echo "❌ Sample data import failed"
        fi
    else
        echo "⚠️  mysql client not available. You can manually import mysql_sample_data.sql"
    fi
fi

echo ""
echo "🎉 MySQL setup completed!"
echo ""
echo "📋 Summary:"
echo "✅ MySQL schema deployed"
echo "✅ Database tables created"
echo "✅ Sample data imported (if selected)"
echo ""
echo "🚀 Your OptiStore Pro medical practice system is ready!"
echo ""
echo "Next steps:"
echo "1. Start the application: npm run dev"
echo "2. Access the system in your browser"
echo "3. Login with admin credentials"
echo ""
echo "📊 The system includes:"
echo "   • Patient management and medical records"
echo "   • Doctor profiles and appointments"
echo "   • Inventory and product management"
echo "   • Invoice and billing system"
echo "   • Prescription management"
echo "   • Financial tracking and reporting"