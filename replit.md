# OptiStore Pro - Medical Practice Management System

## Project Overview
OptiStore Pro is a comprehensive medical practice management system built with React/TypeScript frontend and Express/Node.js backend. The system provides inventory management, appointment scheduling, prescription management, invoicing, and complete financial tracking capabilities for medical practices, specifically designed for optical/eye care facilities.

## Recent Changes
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

### Financial Tracking
- Complete accounting system with chart of accounts
- General ledger entries
- Payment transaction tracking
- Profit/loss reporting
- Expenditure management

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

### Accounting Tables
- `chart_of_accounts` - Accounting structure
- `general_ledger_entries` - All financial transactions
- `payment_transactions` - Payment processing
- `account_categories` - Account organization

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