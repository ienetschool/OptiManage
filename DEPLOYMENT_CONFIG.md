# Deployment Configuration Guide

## Required Deployment Settings

### Build Command
```bash
npm run build
```

### Run Command  
```bash
npm start
```

### Environment Variables
```
NODE_ENV=production
PORT=5000
```

### Additional Deployment Secrets
Ensure these are configured in your Replit Secrets:
- DATABASE_URL (for production database)
- Any API keys your application requires

## Manual Steps to Fix Deployment

1. **Access Deployment Settings**
   - Navigate to your Replit project
   - Click "Deploy" or access existing deployment
   - Go to deployment configuration/settings

2. **Update Commands**
   - Change "Run command" from `npm run dev` to `npm start`
   - Add "Build command": `npm run build`

3. **Set Environment Variables**
   - Add `NODE_ENV=production`
   - Ensure `PORT=5000` is set

4. **Redeploy**
   - Save configuration changes
   - Trigger a new deployment

## Current Package.json Scripts (Verified ✅)
- `build`: Builds frontend (Vite) and backend (esbuild) for production
- `start`: Runs production server with NODE_ENV=production
- `dev`: Development server (should NOT be used for deployment)

## Why This Fixes the Issue
- **Security**: Production mode disables development features
- **Performance**: Optimized builds and production settings
- **Reliability**: Proper error handling and logging for production
- **Standards**: Follows production deployment best practices