# OptiStore Pro - Multi-Store Management System

A comprehensive optical store management system built with React, Node.js, and PostgreSQL. Designed for modern optical retail businesses with advanced inventory management, professional invoicing, and medical practice integration.

## 🌟 Key Features

### 📦 Enhanced Inventory Management
- **Barcode Support**: Auto-generation and manual entry with unique constraints
- **Real-time Stock Tracking**: Live inventory monitoring with visual indicators
- **Smart Alerts**: Low stock and out-of-stock notifications
- **Purchase Orders**: Automated expense tracking for supplier orders
- **Stock Movements**: Complete audit trail for all inventory changes

### 🧾 Professional Invoicing
- **A4 Format Templates**: Professional invoice layouts optimized for printing
- **PDF Generation**: High-quality PDF export and print functionality
- **Multi-payment Support**: Cash, card, check, and digital payment methods
- **Patient Billing**: Medical practice integration with patient profiles
- **Automated Calculations**: Tax, discount, and total calculations

### 🏥 Medical Practice Integration
- **Patient Management**: Comprehensive medical profiles and history
- **Appointment Scheduling**: Advanced booking system with notifications
- **Prescription Tracking**: Digital prescription management
- **Treatment History**: Complete medical record keeping
- **QR Code Generation**: Medical record access and verification

### 🏪 Multi-Store Operations
- **Centralized Management**: Control multiple store locations
- **Store-specific Settings**: Individual configurations and preferences
- **Cross-store Inventory**: Transfer and track products between locations
- **Performance Analytics**: Store comparison and reporting

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **PDF Generation**: PDFKit and jsPDF
- **QR Codes**: React QR Code generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd optistore-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database and configuration details
   ```

4. **Database setup**
   ```bash
   # Option A: Restore from backup
   psql $DATABASE_URL < database_backup_complete_[timestamp].sql
   
   # Option B: Fresh installation
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📊 Database Schema

**Latest Backup**: `db_backup0308250333.sql` - Complete production database

The system includes comprehensive data models for:

- **Products**: Enhanced with barcode field and unique constraints
- **Store Inventory**: Complete schema with min_stock, max_stock, location, reserved_quantity
- **Purchase Orders**: Supplier order tracking and automated expense accounting
- **Modern Invoices**: Professional billing with A4 PDF export capabilities
- **Patients**: Medical practice management with complete profiles
- **Appointments**: Advanced scheduling with doctor assignment logic
- **Users**: Role-based access control (admin, manager, staff, doctor)

## 🎯 Recent Enhancements

### Final Updates (August 3, 2025)
- ✅ **Fixed Product Creation**: Resolved database schema issues and errors
- ✅ **Modern Invoice Template**: Professional orange-themed A4 layout matching design specs
- ✅ **Enhanced Database Schema**: Complete store inventory with all required columns
- ✅ **Barcode System**: Auto-generation with unique constraints for data integrity
- ✅ **Advanced Stock Management**: Real-time tracking with visual alerts and notifications
- ✅ **Professional PDF Export**: High-quality invoice generation with print optimization
- ✅ **Complete System Testing**: All core features verified and production-ready

## 📋 Deployment Options

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in dashboard
3. Deploy with automatic builds

### Railway
1. Connect repository to Railway
2. Add PostgreSQL plugin
3. Configure environment variables

### Docker
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

## 🔧 Configuration

### Environment Variables
See `.env.example` for complete configuration options including:
- Database connection settings
- Authentication configuration
- Email and SMS settings
- Payment gateway integration
- File storage options

### Database Migrations
- Schema changes tracked in `shared/schema.ts`
- Use `npm run db:push` for applying changes
- Complete backup included for restoration

## 📈 Performance Features

- **Optimized Queries**: Efficient database operations with proper indexing
- **Caching Strategy**: Smart caching for frequently accessed data
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Live data synchronization across components
- **Error Handling**: Comprehensive error management and user feedback

## 🔒 Security Features

- **Role-based Access**: Admin, manager, and staff permission levels
- **Session Management**: Secure session handling with PostgreSQL storage
- **Data Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Parameterized queries and ORM protection
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📚 Documentation

- `DEPLOYMENT_INSTRUCTIONS.md` - Detailed deployment guide
- `PROJECT_EXPORT_SUMMARY.md` - Complete project overview
- `GITHUB_DEPLOYMENT.md` - GitHub-specific deployment notes
- `replit.md` - Development and architecture documentation

## 🤝 Contributing

This is a production-ready optical store management system. For customization or additional features, the codebase is well-structured with clear separation of concerns and comprehensive documentation.

## 📄 License

Professional optical store management system - All rights reserved.

## 📞 Support

For deployment assistance or technical questions, refer to the comprehensive documentation included in this repository.

---

**OptiStore Pro** - Empowering optical retail businesses with modern technology and professional management tools.