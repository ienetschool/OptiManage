#!/bin/bash

# GitHub Actions Setup Script
# Configures automatic deployment via GitHub

echo "🐙 GITHUB ACTIONS SETUP"
echo "======================"

# Create .github directory if it doesn't exist
mkdir -p .github/workflows

echo "✅ GitHub Actions workflow created: .github/workflows/deploy-production.yml"
echo ""

echo "📋 SETUP INSTRUCTIONS:"
echo "1. Add SSH key to GitHub Secrets:"
echo "   - Go to: GitHub Repository → Settings → Secrets and variables → Actions"
echo "   - Add secret: PRODUCTION_SSH_KEY"
echo "   - Value: Your SSH private key for vivassh@5.181.218.15"
echo ""

echo "2. Generate SSH key (if needed):"
echo "   ssh-keygen -t rsa -b 4096 -C 'github-actions@optistorepro.com'"
echo "   cat ~/.ssh/id_rsa.pub  # Add this to your server's authorized_keys"
echo "   cat ~/.ssh/id_rsa      # Add this to GitHub secrets"
echo ""

echo "3. Test deployment:"
echo "   git add ."
echo "   git commit -m 'Setup automatic deployment'"
echo "   git push origin main"
echo ""

echo "🔄 AUTOMATIC DEPLOYMENT FEATURES:"
echo "- Deploys on every push to main branch"
echo "- Uploads server/, shared/, client/ files"
echo "- Restarts production server with MySQL"
echo "- Tests deployment success"
echo "- Sends deployment notifications"
echo ""

echo "✅ GitHub Actions setup complete!"