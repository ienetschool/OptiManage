# 📋 Manual Testing Steps for Production Fix

## Copy these commands exactly:

### 1. Connect to your server:
```bash
ssh root@5.181.218.15
```

### 2. Go to your application folder:
```bash
cd /var/www/vhosts/opt.vivaindia.com/httpdocs/
```

### 3. Test if MySQL endpoint exists:
```bash
curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"
```

**Expected Result:**
- If you see `404` or `Cannot GET` → The endpoint is missing (continue to step 4)
- If you see JSON with "success":true → The endpoint exists (skip to step 6)

### 4. Check PM2 status:
```bash
pm2 status
```

### 5. Check application logs:
```bash
pm2 logs --lines 20
```

### 6. Test database connection directly:
```bash
mysql -h localhost -u ledbpt_optie -p opticpro
```
Enter password: `g79h94LAP`

If connected successfully, type:
```sql
SHOW TABLES;
exit
```

### 7. Restart application:
```bash
pm2 restart all
```

### 8. Test again:
```bash
curl -X POST http://localhost:8080/api/mysql-test -H "Content-Type: application/json" -d "{}"
```

### 9. Test in browser:
Open: https://opt.vivaindia.com/install
Click "Test Database Connection"

## What to Look For:
- ✅ JSON response with "success":true and "Found 2 stores"
- ❌ 404 error = Missing endpoint, need to upload new routes.ts
- ❌ 500 error = Database connection issue
- ❌ Connection refused = Application not running