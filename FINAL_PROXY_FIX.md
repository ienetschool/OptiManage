# FINAL PROXY CONFIGURATION FIX

## GOOD NEWS: PM2 is Running!
From your screenshot, I can see:
- ✅ PM2 process "optistore-production" is online
- ✅ Using 35.8MB memory (healthy)
- ✅ Node.js server is running

## The Issue: Nginx Proxy Configuration
The 502 error means nginx can't connect to your Node.js server on port 8080, even though it's running.

## Fix in Plesk (Easiest Method)

1. **Login to Plesk Panel**
2. **Go to**: Domains > opt.vivaindia.com > Apache & nginx Settings
3. **Add this to "Additional nginx directives"**:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

4. **Click "OK" to apply**
5. **Wait 30 seconds** for nginx to reload

## Alternative: SSH Method

If Plesk doesn't work, use SSH:

```bash
# Test if server responds locally
curl http://localhost:8080/api/dashboard

# Check PM2 logs
pm2 logs optistore-production

# Check nginx error logs
tail -f /var/log/nginx/error.log
```

## Expected Result
After fixing the proxy:
- ✅ https://opt.vivaindia.com will load your medical practice app
- ✅ All patient/appointment editing will work
- ✅ No more 502 errors

The Node.js server is running perfectly - we just need nginx to proxy requests to it correctly.