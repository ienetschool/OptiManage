#!/bin/bash

# Continuous Deployment Setup
# Watches for file changes and automatically deploys to production

PROD_HOST="5.181.218.15"
PROD_USER="vivassh"
PROD_PATH="/var/www/vhosts/vivaindia.com/opt.vivaindia.sql"
DATABASE_URL="mysql://ledbpt_optie:g79h94LAP@localhost:3306/opticpro"

echo "🔄 CONTINUOUS DEPLOYMENT ACTIVATED"
echo "=================================="
echo "Watching: server/, shared/, client/ folders"
echo "Target: $PROD_USER@$PROD_HOST:$PROD_PATH"
echo "MySQL: opticpro database"
echo ""
echo "Press Ctrl+C to stop watching..."
echo ""

# Function to deploy on file change
deploy_on_change() {
    echo "📁 File change detected: $1"
    echo "🚀 Starting automatic deployment..."
    
    # Run the auto-deploy script
    ./auto-deploy.sh
    
    echo "✅ Deployment complete! Watching for next change..."
    echo ""
}

# Export the function so it can be used by nodemon
export -f deploy_on_change

# Start watching with nodemon
npx nodemon \
    --watch server \
    --watch shared \
    --watch client \
    --ext "ts,js,tsx,jsx,json" \
    --exec "deploy_on_change"