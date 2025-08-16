#!/bin/bash

echo "TESTING ALL ACCESS METHODS"
echo "=========================="

echo "1. Testing HTTPS with domain:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "https://opt.vivaindia.com/api/dashboard" | head -1

echo ""
echo "2. Testing HTTP with domain:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "http://opt.vivaindia.com/api/dashboard" | head -1

echo ""
echo "3. Testing direct IP with port 8080:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "http://5.181.218.15:8080/api/dashboard" | head -1

echo ""
echo "4. Testing domain with port 8080:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "http://opt.vivaindia.com:8080/api/dashboard" | head -1

echo ""
echo "5. Testing HTTPS domain with port 8080:"
curl -s -w "Status: %{http_code}, Time: %{time_total}s\n" "https://opt.vivaindia.com:8080/api/dashboard" | head -1

echo ""
echo "6. Testing root domain access:"
curl -s -w "Status: %{http_code}\n" "https://opt.vivaindia.com/" | head -1