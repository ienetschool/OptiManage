#!/bin/bash

# GitHub setup script for OptiStore Pro
# This script helps you configure GitHub integration

echo "🔧 Setting up GitHub integration for OptiStore Pro"
echo "=================================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Get user input for GitHub repository
echo ""
echo "📝 Please provide your GitHub repository details:"
echo ""
read -p "GitHub username: " GITHUB_USER
read -p "Repository name (e.g., optistore-pro): " REPO_NAME

# Validate input
if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
    echo "❌ Please provide both username and repository name."
    exit 1
fi

REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Configure git user if not already configured
if [ -z "$(git config user.name)" ]; then
    read -p "Your name for git commits: " USER_NAME
    git config user.name "$USER_NAME"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Your email for git commits: " USER_EMAIL
    git config user.email "$USER_EMAIL"
fi

# Initialize git repository if needed
if [ ! -d ".git" ]; then
    echo "🔄 Initializing git repository..."
    git init
    git branch -M main
fi

# Configure remote
echo "🔗 Configuring GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Create initial commit if needed
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "📁 Creating initial commit..."
    git add .
    git commit -m "Initial commit: OptiStore Pro - Comprehensive Optical Store Management System

Features:
- Patient management with medical records
- Appointment scheduling and tracking
- Inventory management
- Sales and billing system
- QR code integration
- Professional print reports
- Multi-store support

Built with React, Express, PostgreSQL, and TypeScript"
fi

# Make auto-commit script executable
chmod +x scripts/auto-commit.sh

echo ""
echo "✅ GitHub integration setup complete!"
echo ""
echo "🚀 To push your code to GitHub, run:"
echo "   ./scripts/auto-commit.sh \"Initial setup\""
echo ""
echo "📝 Your repository URL: $REPO_URL"
echo ""
echo "⚠️  Note: Make sure your GitHub repository exists and you have push access."
echo "   You may need to authenticate with GitHub using a personal access token."