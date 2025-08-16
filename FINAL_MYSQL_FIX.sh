#!/bin/bash

echo "FINAL MYSQL FIX - Complete Database Synchronization"
echo "=================================================="

# Set the exact MySQL database URL for both environments
export DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro"

echo "Using MySQL Database: $DATABASE_URL"

# Test development server with MySQL
echo "Testing development MySQL connection..."
curl -s -X POST http://localhost:5000/api/patients -H "Content-Type: application/json" -d '{"firstName":"DevFinalTest","lastName":"MySQL","phone":"1234567890","email":"devfinal@mysql.test"}' | head -c 200

# Test production server with MySQL  
echo -e "\nTesting production MySQL connection..."
curl -s -X POST https://opt.vivaindia.com/api/patients -H "Content-Type: application/json" -d '{"firstName":"ProdFinalTest","lastName":"MySQL","phone":"0987654321","email":"prodfinal@mysql.test"}' | head -c 200

echo -e "\nMySQL database tests completed"