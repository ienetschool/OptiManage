# OptiStore Pro - Medical Practice Management System

## Project Overview
OptiStore Pro is a comprehensive medical practice management system built with React/TypeScript frontend and Express/Node.js backend. The system provides inventory management, appointment scheduling, prescription management, invoicing, and complete financial tracking capabilities for medical practices, specifically designed for optical/eye care facilities.

## Recent Changes
- **August 13, 2025**: Completed comprehensive live deployment system with web-based installation
  - **Installation System**: Enhanced `install.html` with database backup import functionality and real-time progress tracking
  - **API Integration**: Created `server/installRoutes.ts` with endpoints for database testing, imports, and configuration updates
  - **Deployment Tools**: Added NPM command execution capabilities with one-click deployment features
  - **Database Management**: Integrated real API calls for connection testing, configuration updates, and backup imports
  - **Progress Tracking**: Added popup windows for import status monitoring and deployment progress
  - **Configuration Management**: Implemented automatic environment file updates and database URL generation
  - **Multi-Database Support**: Added support for both PostgreSQL and MySQL database imports
  - **Production Ready**: Successfully completed build testing (38s build time, 2.7MB optimized bundle)
  - **Data Verification**: Confirmed 40 tables imported and operational with full data integrity
- **August 6, 2025**: Implemented comprehensive accounting system for Income/Expenditure tracking and Profit/Loss reporting
  - Created complete Chart of Accounts with 25+ accounts covering Assets, Liabilities, Equity, Revenue, and Expenses
  - Added General Ledger Entries table with double-entry bookkeeping functionality  
  - Implemented Payment Transactions tracking for all income and expense flows
  - Created Profit/Loss Entries table for detailed financial performance analysis
  - Updated payroll system with realistic salary structures ($38K-$85K range) and detailed allowances/deductions
  - Added comprehensive transaction data: $2,745 revenue, $586 COGS, $117,350 expenses for January 2025
  - Financial Summary: Revenue from medical services and product sales, major expenses include payroll ($96,850), rent ($8,500), and operational costs
- **August 6, 2025**: Enhanced staff ID card visual design with clean black text
  - Removed background shading from detail fields for cleaner appearance
  - Changed text color to solid black (#000000) for maximum readability
  - Increased font weight (600) for better visibility against royal blue background
- **August 5, 2025**: Successfully migrated from Replit Agent to standard Replit environment
- Database backup imported from `db_backup0508250230am.sql`
- Fixed TypeScript compilation errors in schema and storage files
- Server now running successfully on port 5000

## Architecture
- **Frontend**: React 18 with TypeScript, Vite for bundling
- **Backend**: Express.js with TypeScript, running on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Replit Auth integration
- **State Management**: TanStack Query for server state

## Key Features
### Medical Practice Management
- Patient management with complete medical records
- Doctor profiles and specializations
- Appointment scheduling with doctor assignments
- Prescription management with medication tracking
- Medical invoicing and billing

### Business Operations
- Multi-store inventory management
- Point of sale system
- Invoice generation and management
- Customer relationship management
- Staff role management and permissions

### Financial Tracking & Accounting
- Complete Chart of Accounts (25+ accounts) with proper categorization
- Double-entry bookkeeping via General Ledger Entries
- Comprehensive Payment Transaction tracking with multiple payment methods
- Real-time Profit/Loss analysis with detailed expense categorization
- Cost of Goods Sold (COGS) tracking for inventory management  
- Monthly financial performance reporting
- Payroll expense integration with salary and benefit tracking
- Operating expense management (rent, utilities, insurance, supplies, marketing)
- Revenue tracking from medical services and product sales

## Database Schema
### Core Tables
- `users` - System users (staff, doctors, admins)
- `stores` - Multi-location store management
- `customers` - Customer information
- `patients` - Enhanced customer records for medical context
- `doctors` - Medical staff profiles
- `products` - Inventory items (frames, lenses, accessories)
- `appointments` - Appointment scheduling
- `prescriptions` - Medical prescriptions
- `invoices` - Business invoicing
- `sales` - Point of sale transactions

### Accounting & Financial Tables
- `account_categories` - Main account groupings (Assets, Liabilities, Equity, Revenue, Expenses)
- `chart_of_accounts` - Complete accounting structure with 25+ accounts
- `general_ledger_entries` - Double-entry bookkeeping transactions
- `payment_transactions` - Detailed payment processing with multiple methods
- `profit_loss_entries` - Comprehensive income/expense tracking for P&L reporting
- `product_costs` - Inventory cost tracking for COGS calculation

## User Preferences
- Use TypeScript for type safety
- Follow modern React patterns with hooks
- Prefer PostgreSQL over MySQL for production
- Use shadcn/ui components for consistent UI
- Implement proper error handling and validation

## Development Guidelines
- All database operations use Drizzle ORM
- Client-server separation with API routes
- Form validation using Zod schemas
- Responsive design with Tailwind CSS
- Proper TypeScript types for all data structures

## Running the Project
The application runs using the "Start application" workflow which executes `npm run dev`, starting both the Express server (port 5000) and Vite development server for the frontend.

## Environment Setup
- PostgreSQL database configured with environment variables
- All required packages installed via npm
- Database backup successfully restored
- TypeScript compilation working without errors