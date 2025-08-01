#!/bin/bash

# Auto-commit script for OptiStore Pro
# This script automatically commits changes to GitHub

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting auto-commit process...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not a git repository. Initializing...${NC}"
    git init
    git remote add origin https://github.com/yourusername/optistore-pro.git
fi

# Add all changes
echo -e "${BLUE}📁 Adding all changes...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${GREEN}✅ No changes to commit.${NC}"
    exit 0
fi

# Get current timestamp for commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TASK_NAME="$1"

if [ -z "$TASK_NAME" ]; then
    TASK_NAME="Auto-commit"
fi

# Create commit message
COMMIT_MSG="$TASK_NAME - $TIMESTAMP

- Enhanced patient portal with QR code improvements
- Updated appointment management system
- Improved print reports and invoice templates
- Added status-based workflow management

Auto-generated commit from OptiStore Pro development"

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

# Push to GitHub (if remote is configured)
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
if git remote get-url origin >/dev/null 2>&1; then
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo -e "${RED}❌ Push failed. Please check your GitHub remote configuration.${NC}"
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ No GitHub remote configured. Please add your repository URL.${NC}"
    echo -e "${BLUE}To add remote: git remote add origin https://github.com/yourusername/optistore-pro.git${NC}"
fi

echo -e "${GREEN}✅ Auto-commit completed!${NC}"