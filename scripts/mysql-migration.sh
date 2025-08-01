#!/bin/bash

# MySQL Migration Script for OptiStore Pro
# This script helps migrate from PostgreSQL to MySQL

echo "🏥 OptiStore Pro MySQL Migration Tool"
echo "====================================="

# Check if MySQL client is available
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL client not found. Please install MySQL client tools."
    exit 1
fi

# Get MySQL connection details
echo "Enter your MySQL connection details:"
read -p "MySQL Host (localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "MySQL Port (3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "MySQL Username: " MYSQL_USER
read -s -p "MySQL Password: " MYSQL_PASSWORD
echo

read -p "Database Name (optistorepro): " MYSQL_DATABASE
MYSQL_DATABASE=${MYSQL_DATABASE:-optistorepro}

# Create DATABASE_URL
export DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}"

echo "Database URL: mysql://${MYSQL_USER}:***@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}"

# Test connection
echo "Testing MySQL connection..."
mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" "$MYSQL_DATABASE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ MySQL connection successful!"
else
    echo "❌ MySQL connection failed. Please check your credentials."
    exit 1
fi

# Generate MySQL schema
echo "Generating MySQL schema..."
npx drizzle-kit generate --config=drizzle.mysql.config.ts

if [ $? -eq 0 ]; then
    echo "✅ MySQL schema generated successfully!"
else
    echo "❌ Schema generation failed!"
    exit 1
fi

# Push schema to MySQL database
echo "Pushing schema to MySQL database..."
npx drizzle-kit push --config=drizzle.mysql.config.ts

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
    echo ""
    echo "🎉 MySQL migration completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the MySQL DATABASE_URL"
    echo "2. Update server/index.ts to use MySQL database connection"
    echo "3. Import your data using the provided SQL migration script"
    echo ""
    echo "DATABASE_URL=\"$DATABASE_URL\""
else
    echo "❌ Schema push failed!"
    exit 1
fi