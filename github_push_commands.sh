#!/bin/bash

# OptiStore Pro - GitHub Push Commands
# Run these commands to push the complete project to GitHub

echo "🚀 OptiStore Pro - GitHub Deployment Script"
echo "============================================"

# Step 1: Add all files to git
echo "📁 Adding all files to git..."
git add .

# Step 2: Commit with descriptive message
echo "💾 Committing changes..."
git commit -m "Complete OptiStore Pro export with enhanced inventory management

Features included:
- Enhanced inventory system with barcode support
- Professional invoice management with PDF generation
- Comprehensive product management with stock tracking
- Purchase order system for expense automation
- Patient and customer management
- Medical practice integration
- Real-time stock monitoring and alerts
- Professional billing and payment processing
- Complete database backup included

Technical improvements:
- Barcode field added to products with unique constraints
- Stock management with reserved quantities
- Purchase order expense tracking
- Professional A4 invoice templates
- Enhanced UI/UX with modern design
- Production-ready deployment configuration"

# Step 3: Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Export completed successfully!"
echo ""
echo "📋 What was exported:"
echo "- Complete React/Node.js application"
echo "- Enhanced inventory management system"
echo "- Professional invoicing with PDF support"
echo "- Database backup with all data and schema"
echo "- Deployment documentation and instructions"
echo "- Production-ready configuration files"
echo ""
echo "🗂️ Database backup file: database_backup_complete_$(date +%Y%m%d_%H%M%S).sql"
echo "📖 Deployment guide: DEPLOYMENT_INSTRUCTIONS.md"
echo "📊 Project summary: PROJECT_EXPORT_SUMMARY.md"
echo ""
echo "🎯 Your project is now ready for deployment on any platform!"