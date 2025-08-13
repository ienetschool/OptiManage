# Simple 5-Minute Setup

## Step 1: Connect to Your Server
```bash
ssh root@5.181.218.15
```
Password: `&8KXC4D+Ojfhuu0LSMhE`

## Step 2: Run This Single Command
Copy and paste this entire block:

```bash
dnf update -y && dnf install -y curl wget git nodejs npm && npm install -g pm2 && mkdir -p /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app && cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app && echo "Setup complete! Upload your files here: $(pwd)"
```

## Step 3: Upload Your Files
Upload all your OptiStore Pro files to:
`/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app/`

## Step 4: Deploy
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
npm install
npm run build
pm2 start server/index.js --name optistore
```

## Step 5: Configure Domain in Plesk
1. Login to Plesk
2. Go to opt.vivaindia.com settings  
3. Add this to Nginx settings:
```
location / {
    proxy_pass http://127.0.0.1:5000;
}
```
4. Enable SSL

Done! Your app will be live at https://opt.vivaindia.com