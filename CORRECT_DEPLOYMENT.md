# Correct OptiStore Pro Deployment

## Your Application Structure
- **Server**: `server/index.ts` (TypeScript source)
- **Built file**: `dist/index.js` (after npm run build)
- **Start command**: `node dist/index.js`

## Fixed Deployment Commands

### Step 1: Basic Server Setup
```bash
ssh root@5.181.218.15
dnf update -y && dnf install -y nodejs npm && npm install -g pm2
mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
```

### Step 2: Upload Your Files
Upload all your OptiStore Pro files to:
```
/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/
```

Include these important files:
- `package.json`
- `server/` folder (with index.ts)
- `client/` folder
- `shared/` folder
- All config files (vite.config.ts, etc.)

### Step 3: Deploy (Correct Commands)
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app

# Install dependencies
npm install

# Build the application (creates dist/index.js)
npm run build

# Start with PM2 using the built file
pm2 start dist/index.js --name optistore-pro

# Check status
pm2 status
```

### Step 4: Environment Setup
```bash
# Create production environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt
COMPANY_NAME=OptiStore Pro
ADMIN_EMAIL=admin@opt.vivaindia.com
DOMAIN=https://opt.vivaindia.com
SESSION_SECRET=OptiStore-Pro-2025-Secret
EOF
```

### Step 5: Plesk Configuration
1. Login to Plesk
2. Go to opt.vivaindia.com → Apache & Nginx Settings
3. Add this nginx directive:
```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
4. Enable SSL certificate

## Management Commands
```bash
pm2 status                    # Check app status
pm2 logs optistore-pro       # View logs
pm2 restart optistore-pro    # Restart app
pm2 stop optistore-pro       # Stop app
```

## Key Differences from Before
- Use `dist/index.js` not `server/index.js`
- Must run `npm run build` first to create dist folder
- TypeScript gets compiled to JavaScript in dist/

Your app will be live at https://opt.vivaindia.com once deployed!