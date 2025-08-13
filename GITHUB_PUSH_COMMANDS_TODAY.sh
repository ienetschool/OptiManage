#!/bin/bash

# OptiStore Pro - GitHub Export Commands
# Created: August 13, 2025

echo "=== OptiStore Pro GitHub Export ===" 

# Initialize git repository
git init .

# Add all project files
git add .

# Create initial commit
git commit -m "Initial commit: OptiStore Pro Medical Practice Management System

- Complete React/TypeScript frontend with medical practice UI
- Express.js backend with PostgreSQL database integration  
- 40+ database tables with full medical practice schema
- Web-based installation system (install.html)
- Database backup and import functionality
- Production-ready build system
- Comprehensive documentation and deployment guides

Features:
- Patient management and medical records
- Doctor profiles and appointment scheduling
- Prescription management and medical invoicing
- Multi-store inventory and POS system
- Complete financial tracking and accounting
- Staff management and role permissions
- Real-time dashboard and reporting

Technical Stack:
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express.js, Drizzle ORM
- Database: PostgreSQL with 40 operational tables
- Authentication: Replit Auth integration
- Build: Production optimized (2.7MB frontend, 261KB server)

Ready for production deployment via web installer."

# Add remote repository (replace with your GitHub repo URL)
echo "To push to GitHub, run:"
echo "git remote add origin https://github.com/YOUR_USERNAME/optistorepro.git"
echo "git branch -M main"
echo "git push -u origin main"

echo "=== Export Complete ==="
echo "Database backup: $(ls database_backup_*.sql | tail -1)"
echo "All files ready for GitHub push"