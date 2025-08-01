# OptiStore Pro - Server Deployment Guide

## Database Configuration Files

### Primary Configuration Files:
1. **`drizzle.config.ts`** - Drizzle ORM configuration for migrations
2. **`server/db.ts`** - Database connection setup
3. **`shared/schema.ts`** - Complete database schema definition
4. **`package.json`** - Dependencies and scripts

## Environment Variables Required

Create a `.env` file on your server with these variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@your-server:5432/optistorepro

# Alternative PostgreSQL Variables (if needed)
PGHOST=your-database-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=optistorepro

# Node Environment
NODE_ENV=production

# Optional: Authentication (if using external auth)
SESSION_SECRET=your-random-session-secret-here
```

## Server Requirements

### Technology Stack:
- **Node.js** 18+ 
- **PostgreSQL** 14+
- **PM2** (recommended for process management)

### Required Dependencies:
- `@neondatabase/serverless` (can use regular `pg` for standard PostgreSQL)
- `drizzle-orm` 
- `express`
- `typescript`

## Deployment Steps

### 1. Setup Database

```bash
# Create PostgreSQL database
createdb optistorepro

# Restore your database backup
psql optistorepro < database_backup_20250801_145407.sql
```

### 2. Modify Database Connection (If Not Using Neon)

If using standard PostgreSQL instead of Neon, update `server/db.ts`:

```typescript
// For standard PostgreSQL
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

### 3. Install Dependencies

```bash
npm install --production
npm run build  # If you have a build script
```

### 4. Run Database Migrations

```bash
npx drizzle-kit push:pg
```

### 5. Start Application

```bash
# Development
npm run dev

# Production (recommended with PM2)
pm2 start npm --name "optistore-pro" -- start
```

## Key Configuration Points

### Database Schema
- Complete schema is in `shared/schema.ts`
- Includes all tables: users, stores, patients, appointments, etc.
- Uses UUID primary keys and proper relationships

### Authentication Tables
- `sessions` table (required for Replit Auth - can be modified for other auth)
- `users` table with role-based access control

### Custom Fields Support
- Most tables include `customFields` JSONB columns
- Flexible for additional data requirements

## Production Optimizations

### 1. Database Connection Pooling
Current setup uses connection pooling with `@neondatabase/serverless`. For production PostgreSQL:

```typescript
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Environment Configuration
- Set `NODE_ENV=production`
- Use proper session secrets
- Configure CORS for your domain
- Set up SSL/TLS certificates

### 3. Process Management
Use PM2 for production:

```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## File Structure Summary

```
OptiStore Pro/
├── drizzle.config.ts           # Database migration config
├── server/
│   ├── db.ts                   # Database connection
│   ├── index.ts                # Express server entry
│   └── routes.ts               # API routes
├── shared/
│   └── schema.ts               # Complete database schema
├── client/                     # React frontend
├── package.json                # Dependencies
├── database_backup_*.sql       # Your database backup
└── .env                        # Environment variables (create this)
```

## Troubleshooting

### Common Issues:
1. **Connection refused**: Check DATABASE_URL format
2. **Permission errors**: Ensure database user has proper permissions
3. **Migration errors**: Run `npx drizzle-kit push:pg` to sync schema
4. **Port conflicts**: Default is port 5000, configure as needed

### Database Connection String Format:
```
postgresql://username:password@host:port/database_name
```

Example:
```
postgresql://admin:mypassword@localhost:5432/optistorepro
```