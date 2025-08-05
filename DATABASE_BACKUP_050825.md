# Database Backup - August 5, 2025 1:35 AM

## Backup Details
- **Filename**: db_backup050825135am.sql
- **Created**: Tue Aug  5 05:35:01 AM UTC 2025
- **Database**: PostgreSQL
- **Size**: 98K

## Contents
This backup contains:
- All database tables and schema
- Complete data including invoices, payments, customers, patients
- Store inventory and product information
- User accounts and system settings

## Restore Instructions
```bash
psql DATABASE_URL < db_backup050825135am.sql
```

## Notes
- Created as part of system export to GitHub
- Contains live production data as of backup time
