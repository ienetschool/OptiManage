# 🔧 Quick Production Fix for opt.vivaindia.com

## The Issue
Your production server at https://opt.vivaindia.com/install is running older code without the MySQL connection endpoints. This is why you see "Server not responding" - the `/api/mysql-test` endpoint doesn't exist in the deployed version.

## Immediate Solutions

### Option 1: Direct MySQL Schema Deployment (Fastest)
SSH to your server and run these commands:

```bash
# Connect to your server
ssh root@5.181.218.15

# Test MySQL connection
mysql -h localhost -u ledbpt_optie -p opticpro
# Enter password: g79h94LAP

# If connection works, import the complete schema:
# First download the schema file to your server, then:
mysql -h localhost -u ledbpt_optie -p opticpro < optistore_pro_mysql_complete.sql
```

### Option 2: Upload Single File Fix
Upload just the updated `server/routes.ts` file to your production server:

1. Copy `server/routes.ts` to your server at `/var/www/vhosts/opt.vivaindia.com/httpdocs/server/routes.ts`
2. Restart the application: `pm2 restart all`
3. Test: https://opt.vivaindia.com/install

### Option 3: Complete Deployment Update
Replace your entire production codebase with the current working version.

## Missing Database Columns (Causing 500 Errors)
The schema deployment will add these missing columns:
- `products.barcode`
- `customers.city, state, zip_code`
- `patients.emergency_contact, emergency_phone`
- `store_inventory.reserved_quantity`
- `sales.staff_id`

## Production Server Details
- **Server**: 5.181.218.15
- **App Path**: /var/www/vhosts/opt.vivaindia.com/httpdocs/
- **Database**: MySQL localhost:3306/opticpro
- **Credentials**: ledbpt_optie / g79h94LAP

## Quick Test Commands
After any fix, test these URLs:
- https://opt.vivaindia.com/api/stores (should return 2 stores)
- https://opt.vivaindia.com/install (connection test should work)
- https://opt.vivaindia.com (main application)

The fastest solution is Option 1 - direct MySQL schema import via SSH.