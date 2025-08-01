# GitHub Auto-Commit Setup Guide

This guide will help you set up automatic GitHub commits for your OptiStore Pro project.

## Quick Setup

### 1. First-time Setup
Run the setup script to configure your GitHub repository:
```bash
bash scripts/setup-github.sh
```

This will:
- Configure your git user details
- Set up your GitHub repository URL
- Create the initial commit
- Make the auto-commit script executable

### 2. Manual Commits
To manually commit and push changes:
```bash
bash scripts/auto-commit.sh "Your task description"
```

Example:
```bash
bash scripts/auto-commit.sh "Enhanced patient portal with QR codes"
```

### 3. Quick Commands
```bash
# Basic commit with default message
bash scripts/auto-commit.sh

# Commit with custom task name
bash scripts/auto-commit.sh "Fixed appointment management"

# Check git status
git status

# View commit history
git log --oneline
```

## Automatic GitHub Actions (Optional)

The project includes a GitHub Actions workflow that can automatically commit changes when you push to GitHub. This is configured in `.github/workflows/auto-commit.yml`.

## GitHub Repository Setup

1. **Create a new repository** on GitHub:
   - Go to https://github.com/new
   - Name it `optistore-pro` (or your preferred name)
   - Make it public or private as needed
   - Don't initialize with README (we already have one)

2. **Get your repository URL**:
   ```
   https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
   ```

3. **Run the setup script** and provide your details when prompted.

## Authentication

For pushing to GitHub, you may need to:

1. **Use Personal Access Token** (recommended):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `repo` permissions
   - Use this token as your password when prompted

2. **Or use SSH keys** (advanced):
   - Set up SSH keys in your GitHub account
   - Use SSH URL format: `git@github.com:username/repository.git`

## Project Structure

```
optistore-pro/
├── scripts/
│   ├── auto-commit.sh     # Main auto-commit script
│   └── setup-github.sh    # Initial setup script
├── .github/
│   └── workflows/
│       └── auto-commit.yml # GitHub Actions workflow
└── GITHUB_SETUP.md        # This guide
```

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**:
   ```bash
   chmod +x scripts/auto-commit.sh
   ```

2. **"Remote origin already exists"**:
   ```bash
   git remote remove origin
   git remote add origin YOUR_REPO_URL
   ```

3. **Authentication failed**:
   - Use a Personal Access Token instead of password
   - Or set up SSH keys

4. **"No changes to commit"**:
   - This is normal if no files have been modified
   - Make some changes and try again

## Features

- ✅ Automatic timestamp in commit messages
- ✅ Descriptive commit messages with task details
- ✅ Error handling and status feedback
- ✅ Support for both HTTPS and SSH
- ✅ GitHub Actions integration
- ✅ Color-coded terminal output

## Usage Examples

```bash
# After making changes to patient management
bash scripts/auto-commit.sh "Enhanced patient QR code positioning"

# After updating appointment system
bash scripts/auto-commit.sh "Added appointment status tracking"

# After fixing bugs
bash scripts/auto-commit.sh "Fixed invoice generation issues"
```

Each commit will include:
- Your custom task description
- Timestamp
- Automatic description of recent changes
- Professional commit formatting

Happy coding! 🚀