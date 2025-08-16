# PRODUCTION SERVER AND DATABASE CONFIGURATION

## Server Details
- **Server IP**: 5.181.218.15
- **SSH Access**: root@5.181.218.15
- **Production Path**: /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
- **Domain**: opt.vivaindia.com
- **Port**: 8080

## Database Configuration
- **Database Type**: MySQL
- **Host**: 5.181.218.15
- **Port**: 3306
- **Database Name**: opticpro
- **Username**: ledbpt_optie
- **Password**: g79h94LAP
- **Full Connection**: mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro

## What Gets Updated

### Files Being Deployed:
1. **server/medicalRoutes.ts** - Updated with all PUT endpoints for editing
2. **server/index.ts** - Main server file
3. **package.json** - Dependencies
4. **ecosystem.config.js** - PM2 configuration for auto-restart

### Process Management:
- **PM2 Process Name**: optistore-production
- **Memory Limit**: 512MB (prevents crashes)
- **Auto-restart**: Yes
- **Log Files**: ./logs/combined.log

### System Service:
- **Service Name**: optistore.service
- **Location**: /etc/systemd/system/optistore.service
- **Boot Startup**: Enabled

## Environment Variables Set:
```
NODE_ENV=production
PORT=8080
DATABASE_URL=mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro
```

## After Deployment Access:
- **Website URL**: https://opt.vivaindia.com
- **API Endpoints**: https://opt.vivaindia.com/api/*
- **Database**: Same MySQL database used by development

This ensures your production server connects to the same MySQL database as development, with all UPDATE endpoints working for patient/appointment/prescription editing.