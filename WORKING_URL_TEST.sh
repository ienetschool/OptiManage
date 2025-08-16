#!/bin/bash

echo "TESTING ALL POSSIBLE WORKING URLS"
echo "================================="

echo "1. Testing root domain:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com/" | head -1

echo ""
echo "2. Testing /app/ path:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com/app/" | head -1

echo ""
echo "3. Testing API directly:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com/api/dashboard" | head -1

echo ""
echo "4. Testing API through /app/:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com/app/api/dashboard" | head -1

echo ""
echo "5. Testing with port 8080:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com:8080/" --connect-timeout 5 | head -1

echo ""
echo "6. Testing HTTP instead of HTTPS:"
curl -s -w "Status: %{http_code}\n" "http://opt.vivaindia.com/api/dashboard" --connect-timeout 5 | head -1

echo ""
echo "7. Testing direct IP:"
curl -s -w "Status: %{http_code}\n" "http://5.181.218.15:8080/api/dashboard" --connect-timeout 5 | head -1

echo ""
echo "ANALYSIS:"
echo "- 403 = Server running, access restricted"
echo "- 200 = Working endpoint found"  
echo "- 502 = Server not responding"
echo "- 000 = Connection failed"