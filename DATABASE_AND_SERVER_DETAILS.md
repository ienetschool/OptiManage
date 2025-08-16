# OptiStore Pro - Database and Server Configuration Details

## Development Environment (Current Replit Environment)

### Database Configuration
- **Type**: MySQL
- **Host**: 5.181.218.15
- **Port**: 3306
- **Database**: opticpro
- **Username**: ledbpt_optie
- **Password**: g79h94LAP (partially masked in code)
- **Connection String**: `mysql://ledbpt_optie:***@5.181.218.15:3306/opticpro`
- **Connection File**: `server/db.ts`
- **Schema Definition**: `shared/mysql-schema.ts`

### Application Server
- **Platform**: Replit Environment
- **Runtime**: Node.js with TypeScript (tsx)
- **Port**: 5000 (development)
- **Host Binding**: 0.0.0.0 (Replit compatible)
- **Server File**: `server/index.ts`
- **Process Management**: Replit Workflow ("Start application")
- **Build Tool**: Vite (frontend) + Express (backend)

### Current Development Status
- ✅ Application successfully running on port 5000
- ✅ Database connection established to unified MySQL database
- ✅ API endpoints working (auth, customers, stores, patients, products, dashboard)
- ⚠️ One known issue: `/api/store-inventory` endpoint error (storage.getStoreInventory function missing)
- ✅ Authentication working with mock user for development
- ✅ Frontend serving correctly with Vite development server

---

## Production Environment (Hostinger VPS)

### Production Server Details
- **Server IP**: 5.181.218.15
- **Operating System**: AlmaLinux 9 with Plesk
- **Domain**: https://opt.vivaindia.com
- **Alternative Access**: http://opt.vivaindia.com:8080 (direct port access)
- **Application Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/`
- **Alternative Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.sql` (documented in replit.md)

### Production Database Configuration
According to replit.md recent changes, production has used both:

**Current Unified Setup (August 16, 2025)**:
- **Database**: Same MySQL database as development
- **Connection**: `mysql://ledbpt_optie:***@5.181.218.15:3306/opticpro`
- **Rationale**: Unified database eliminates data synchronization issues

**Historical Production Database (documented in deployment files)**:
- **Type**: PostgreSQL
- **Host**: localhost (on production server)
- **Port**: 5432
- **Database**: ieopt
- **Username**: ledbpt_opt
- **Password**: Ra4#PdaqW0c^pa8c
- **Connection**: `postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@5.181.218.15/ieopt?schema=public`

### Production Application Server
- **Port**: 8080 (confirmed active)
- **Process Manager**: PM2
- **Process Name**: "optistore-main"
- **Memory Usage**: ~3.3-6.0mb
- **Runtime**: Node.js with tsx loader (`node --loader tsx/esm`)
- **Startup Command**: `tsx server/index.ts`
- **Status**: ✅ Online and stable (as of August 16, 2025)

### Production Access Methods
1. **Clean Domain Access**: http://opt.vivaindia.com (via nginx proxy)
2. **Direct Port Access**: http://opt.vivaindia.com:8080
3. **Installation Page**: http://opt.vivaindia.com/install

### Production File Structure
```
/var/www/vhosts/vivaindia.com/opt.vivaindia.com/
├── optistore-app/          # Main application directory
├── server/                 # Backend application
├── client/                 # Frontend build files
├── node_modules/           # Dependencies
├── package.json            # Project configuration
├── .env.production         # Environment variables
└── dist/                   # Production build
```

---

## Database Schema

### Technology Stack
- **Development**: MySQL with Drizzle ORM
- **Production**: Currently unified MySQL (previously PostgreSQL)
- **Schema File**: `shared/mysql-schema.ts`
- **Migration Config**: `drizzle.config.ts` (currently configured for PostgreSQL but using MySQL in practice)

### Core Tables
- `users` - User accounts and authentication
- `stores` - Multiple store locations
- `customers` - Customer information and CRM
- `patients` - Medical patient records
- `doctors` - Healthcare provider profiles
- `products` - Inventory items (frames, lenses, solutions)
- `appointments` - Medical appointments
- `prescriptions` - Prescription management
- `invoices` - Billing and invoicing
- `sales` - Point of sale transactions
- `categories` - Product categorization
- `suppliers` - Vendor management
- `storeInventory` - Multi-store inventory tracking

### Sample Data (Production)
- **Customers**: 3 (Rajesh, Priya, Amit)
- **Patients**: 3 medical records
- **Products**: Multiple inventory items
- **Stores**: Multi-location setup

---

## Authentication & Security

### Development Authentication
- **Method**: Mock authentication for development
- **User**: admin@optistorepro.com (ID: 45761289)
- **Session Management**: Express sessions with MySQL storage

### Production Authentication
- **Method**: Replit Auth integration
- **Session Storage**: MySQL sessions table
- **Security**: Passport.js with local and social auth strategies

---

## Environment Variables

### Development (.env.example)
```bash
DATABASE_URL=mysql://username:password@host:port/database_name
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-super-secure-session-secret-here
```

### Production (.env.production.template)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://optistore_admin:YOUR_SECURE_PASSWORD@localhost:5432/optistore_prod
# Or unified MySQL:
# DATABASE_URL=mysql://ledbpt_optie:***@5.181.218.15:3306/opticpro
SESSION_SECRET=CHANGE_THIS_TO_LONG_RANDOM_STRING
DOMAIN=https://opt.vivaindia.com
```

---

## Deployment Configuration

### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'optistore-main',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
```

### Nginx Configuration
- **Purpose**: Proxy port 8080 to clean domain access
- **SSL**: Configured through Plesk
- **Location**: `/etc/nginx/conf.d/` or Plesk configuration

---

## Current Issues & Status

### Development Environment Issues
1. **Storage Interface**: Missing `getStoreInventory` function in storage.ts
2. **Type Mismatches**: Multiple import errors in storage.ts due to schema inconsistencies

### Production Environment Status
- ✅ **Server Online**: PM2 process stable and running
- ✅ **Database Active**: MySQL connection working
- ✅ **Domain Access**: Both clean domain and port access functional
- ✅ **API Endpoints**: Medical practice management APIs operational

### Migration Completion Status
According to progress tracker:
- [x] 1. Install the required packages
- [x] 2. Restart the workflow to see if the project is working
- [ ] 3. Verify the project is working using the feedback tool
- [ ] 4. Inform user the import is completed and mark as completed

---

## Maintenance & Management

### Production Management Commands
```bash
/root/optistore-manage.sh status    # Check application status
/root/optistore-manage.sh logs      # View application logs
/root/optistore-manage.sh restart   # Restart application
/root/optistore-manage.sh health    # Run health check
/root/optistore-manage.sh backup    # Create database backup
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

---

## Network & Access

### Development Access
- **URL**: http://localhost:5000 (in Replit environment)
- **API Base**: http://localhost:5000/api
- **Authentication**: Mock user auto-login

### Production Access
- **Primary**: https://opt.vivaindia.com
- **Alternative**: http://opt.vivaindia.com:8080
- **API**: https://opt.vivaindia.com/api
- **Installation**: http://opt.vivaindia.com/install

---

*Last Updated: August 16, 2025*
*Status: Development environment active, Production environment stable*