# 📁 File Upload Instructions for Plesk

## Based on your file manager, here's what you need to do:

### Step 1: Clear Document Root
Your current document root shows various files. You need to:
1. **Backup existing files** (if any are important)
2. **Clear the directory**: `/var/www/vhosts/opt.vivaindia.com/httpdocs/`
3. **Upload OptiStore Pro files**

### Step 2: Upload These Key Files
Upload the complete OptiStore Pro application:

**Root Directory Files:**
- `package.json`
- `ecosystem.config.js` 
- `.env` (create with your MySQL credentials)
- `app.js` or `server.js`

**Directories to Upload:**
- `server/` (complete backend)
- `client/` (complete frontend) 
- `shared/` (shared schemas)
- `node_modules/` (or run npm install on server)

### Step 3: Create .env File
Create `.env` in the root with:
```env
DATABASE_URL=mysql://ledbpt_optie:Facebook@123@5.181.218.15:3306/opticpro
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
```

### Step 4: File Permissions
Set proper permissions:
```bash
chmod 644 .env
chmod -R 755 server/
chmod -R 755 client/
chmod +x ecosystem.config.js
```

### Step 5: Install Dependencies
SSH into server and run:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
npm install --production
```

### Quick Upload Checklist
- ✅ Clear existing files from httpdocs
- ✅ Upload complete OptiStore Pro application  
- ✅ Create .env with MySQL credentials
- ✅ Set file permissions
- ✅ Run npm install
- ✅ Start with PM2
- ✅ Configure nginx proxy in Plesk
- ✅ Test https://opt.vivaindia.com

### Current File Structure Should Be:
```
/var/www/vhosts/opt.vivaindia.com/httpdocs/
├── package.json
├── ecosystem.config.js
├── .env
├── server/
├── client/
├── shared/
└── node_modules/ (after npm install)
```

After upload, your OptiStore Pro medical practice management system will run on port 8080 and be accessible via https://opt.vivaindia.com through the nginx proxy configuration.