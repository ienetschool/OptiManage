# CURRENT SYSTEM STATUS - VERIFICATION

## Production Server Details
- **Domain**: opt.vivaindia.com
- **Server IP**: 5.181.218.15
- **SSH Access**: root@5.181.218.15
- **Password**: &8KXC4D+Ojfhuu0LSMhE
- **File Path**: /var/www/vhosts/vivaindia.com/opt.vivaindia.sql
- **Expected Port**: 8080

## Database Configuration
- **URL**: mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro
- **Type**: MySQL
- **Database Name**: opticpro
- **Host**: 5.181.218.15:3306

## Current Issue
- Production website showing 502 Bad Gateway
- Server process may not be running or misconfigured
- Need to verify actual server status and restart properly

## Development Status
- Working perfectly on port 5000
- Patient registration with date validation working
- All APIs returning 200 status codes