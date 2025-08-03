# OptiStore Pro - Deployment Instructions

## Quick Start Guide

### 1. Repository Setup
```bash
# Clone or download the project
git clone [your-repo-url]
cd optistore-pro

# Install dependencies
npm install
```

### 2. Environment Configuration
Create `.env` file with the following variables:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Application Settings
NODE_ENV=production
PORT=5000

# Session Configuration
SESSION_SECRET=your-secure-session-secret

# Optional: External API Keys
STRIPE_SECRET_KEY=your-stripe-key
SENDGRID_API_KEY=your-sendgrid-key
```

### 3. Database Setup

#### Option A: Restore from Backup
```bash
# Restore complete database
psql $DATABASE_URL < database_backup_complete_[timestamp].sql
```

#### Option B: Fresh Installation
```bash
# Run database migrations
npm run db:push
```

### 4. Application Startup
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Platform-Specific Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

### Railway Deployment
1. Connect repository to Railway
2. Add PostgreSQL plugin
3. Configure environment variables
4. Deploy with one-click setup

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Database Migration Notes
- All schema changes are tracked in `shared/schema.ts`
- Use `npm run db:push` for applying schema changes
- Backup database before major updates
- Recent enhancements include barcode support and purchase orders

## Production Checklist
- [ ] Environment variables configured
- [ ] Database backup restored
- [ ] SSL certificates configured
- [ ] Domain name pointed to deployment
- [ ] Error monitoring set up
- [ ] Performance monitoring configured
- [ ] Backup strategy implemented

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

2. **Missing Dependencies**
   - Run `npm install` to install packages
   - Clear node_modules and reinstall if needed

3. **Migration Errors**
   - Check database permissions
   - Verify schema compatibility
   - Use backup restoration as fallback

### Support
For deployment assistance or technical questions, refer to the comprehensive documentation included in this export.