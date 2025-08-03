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

The system includes comprehensive data models for:

- **Products**: Enhanced with barcode field and inventory tracking
- **Store Inventory**: Real-time stock management with reserved quantities
- **Purchase Orders**: Supplier order tracking and expense automation
- **Invoices**: Professional billing with detailed line items
- **Patients**: Medical practice management with complete profiles
- **Appointments**: Scheduling system with notifications
- **Users**: Role-based access control (admin, manager, staff)

## 🎯 Recent Enhancements

### Latest Updates (August 2025)
- ✅ Enhanced inventory system with barcode generation
- ✅ Advanced stock management with real-time alerts
- ✅ Purchase order creation for expense automation
- ✅ Professional A4 invoice templates with print optimization
- ✅ Comprehensive product filtering and search capabilities
- ✅ Stock status monitoring with visual indicators
- ✅ Database optimization and constraint improvements

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