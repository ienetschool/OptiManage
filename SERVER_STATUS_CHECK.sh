#!/bin/bash

# Check if production server is now working
echo "CHECKING PRODUCTION SERVER STATUS"
echo "================================="

echo "1. Testing main domain:"
curl -s -w "Status: %{http_code}\n" https://opt.vivaindia.com/ | head -c 100

echo ""
echo "2. Testing API endpoints:"
curl -s -w "Status: %{http_code}\n" https://opt.vivaindia.com/api/dashboard | head -c 150

echo ""
echo "3. Testing patient registration (should work with MySQL fixes):"
curl -s -X POST https://opt.vivaindia.com/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"ServerTest","lastName":"User","phone":"1234567890","email":"servertest@test.com"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "4. Checking if server processes are running on production:"
echo "This would show tsx processes if server is active"