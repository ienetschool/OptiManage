#!/bin/bash

# Quick Deployment Commands
# Easy access to all deployment methods

echo "🚀 OPTISTORE PRO DEPLOYMENT COMMANDS"
echo "===================================="
echo ""

case "$1" in
    "manual")
        echo "📤 Running manual deployment..."
        ./auto-deploy.sh
        ;;
    "watch")
        echo "👀 Starting continuous deployment..."
        ./deployment/continuous-deploy.sh
        ;;
    "github")
        echo "🐙 Pushing to GitHub (triggers auto-deployment)..."
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        ;;
    "setup")
        echo "⚙️ Running GitHub setup..."
        ./deployment/github-setup.sh
        ;;
    "test")
        echo "🧪 Testing production server..."
        curl -f https://opt.vivaindia.com/api/dashboard && echo "✅ Dashboard API working"
        curl -f https://opt.vivaindia.com/api/patients && echo "✅ Patient API working"
        ;;
    *)
        echo "Usage: $0 [manual|watch|github|setup|test]"
        echo ""
        echo "DEPLOYMENT OPTIONS:"
        echo "  manual  - Deploy current code immediately"
        echo "  watch   - Watch files and auto-deploy on changes"
        echo "  github  - Push to GitHub (triggers automatic deployment)"
        echo "  setup   - Configure GitHub Actions"
        echo "  test    - Test production server status"
        echo ""
        echo "EXAMPLES:"
        echo "  $0 manual    # Deploy now"
        echo "  $0 watch     # Start continuous deployment"
        echo "  $0 github    # Push and deploy via GitHub"
        ;;
esac