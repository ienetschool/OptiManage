# Automatic Deployment Setup

## Option 1: GitHub Actions (Recommended)

### Setup Steps:
1. **Add SSH Key to GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add new secret: `PRODUCTION_SSH_KEY`
   - Value: Your private SSH key for vivassh@5.181.218.15

2. **Automatic Deployment:**
   - Every push to main/master branch automatically deploys to production
   - GitHub Actions file: `.github/workflows/deploy-production.yml`
   - Deploys server/, shared/, client/ folders
   - Restarts production server with MySQL
   - Tests deployment success

### GitHub Actions Features:
- ✅ Automatic deployment on code push
- ✅ Production server restart
- ✅ MySQL database integration
- ✅ Deployment status notifications
- ✅ Rollback capability

## Option 2: Manual Auto-Deploy Script

### Quick Deployment:
```bash
# Run this command anytime to deploy current code
./auto-deploy.sh
```

### What it does:
- Uploads all changed files to production server
- Restarts server with MySQL database
- Tests API endpoints
- Confirms deployment success

## Option 3: Watch & Deploy (Continuous)

### Setup file watcher:
```bash
# Install file watcher
npm install -g nodemon

# Watch for changes and auto-deploy
nodemon --watch server --watch shared --watch client --exec "./auto-deploy.sh"
```

## Current Production Setup:
- **Server:** vivassh@5.181.218.15:/var/www/vhosts/vivaindia.com/opt
- **Database:** MySQL opticpro (ledbpt_optie@localhost:3306)
- **Port:** 8080
- **Domain:** https://opt.vivaindia.com

## Benefits:
- No manual file copying
- Automatic server restarts
- MySQL compatibility maintained
- Instant production updates
- Error detection and rollback

Choose the option that works best for your workflow!