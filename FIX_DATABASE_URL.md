# Fix Database URL Connection Issue

## Problem Identified
The application crashes with "TypeError: Invalid URL" when parsing the PostgreSQL connection string.

## Issue Analysis
Current DATABASE_URL: `postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt`
Problem: Special characters in password (#) may need URL encoding

## Solutions to Try

### 1. URL-encode the password
```bash
cd /var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app
DATABASE_URL="postgresql://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" node dist/index.js
```

### 2. Alternative connection format
```bash
DATABASE_URL="postgres://ledbpt_opt:Ra4%23PdaqW0c%5Epa8c@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" node dist/index.js
```

### 3. Individual connection parameters
```bash
PGHOST="localhost" PGPORT="5432" PGDATABASE="ieopt" PGUSER="ledbpt_opt" PGPASSWORD="Ra4#PdaqW0c^pa8c" NODE_ENV="production" PORT="5000" node dist/index.js
```

### 4. Test with simple connection first
```bash
DATABASE_URL="postgresql://ledbpt_opt@localhost:5432/ieopt" NODE_ENV="production" PORT="5000" node dist/index.js
```

## URL Encoding Reference
- `#` becomes `%23`
- `^` becomes `%5E`
- `@` becomes `%40`

Try these in order until one works.