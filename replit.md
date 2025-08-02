# OptiStore Pro - Multi-Store Management System

## Overview
OptiStore Pro is a comprehensive multi-store management system designed for optical retail businesses. It provides a centralized platform for managing multiple store locations, inventory, sales, appointments, and customer relationships. The application aims to streamline operations, enhance customer engagement, and provide valuable business insights through a modern full-stack architecture.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (August 2, 2025)
- **COMPLETED: Enhanced Patient Medical Profile with Comprehensive History** - Rebuilt Patient Medical Profile with detailed appointment history showing clinical notes, payment status, and professional medical workflow tracking
- **COMPLETED: Advanced Prescription History Display** - Added comprehensive prescription history with vision parameters (SPH, CYL, AXIS), doctor information, and treatment details
- **COMPLETED: Professional Billing & Invoice System** - Implemented detailed billing summary with downloadable invoices, payment history, and comprehensive financial tracking
- **COMPLETED: Medical Document Generation Suite** - Added PDF report generation for appointments, prescriptions, and billing with professional medical formatting and QR codes
- **COMPLETED: Enhanced Action Button System** - Comprehensive action buttons for PDF reports, invoices, QR codes, email sharing, and WhatsApp communication
- **COMPLETED: Professional Card-Style Layout** - Consistent visual design with status badges, progress tracking, and hover effects across all medical modules
- **COMPLETED: Patient QR Code Repositioning** - Removed large QR code section from patient view popup and added compact QR code in header for better layout and scanning accessibility
- **COMPLETED: Enhanced Staff Module** - Added comprehensive Payroll & Documents tab with photo upload, qualification documents, salary management, leave tracking, and Staff ID card generation with QR codes
- **COMPLETED: Professional Positions Dropdown** - Implemented role-based position selection (Doctor, Optometrist, Nurse, Technician, etc.) for proper medical practice hierarchy
- **COMPLETED: Action Button Consistency** - Applied exact same action dropdown structure from Patients module to Appointments module (View Details, Edit, Cancel)
- **COMPLETED: MySQL Database Migration** - Successfully migrated entire project from PostgreSQL to MySQL for server compatibility with phpMyAdmin access
- **NEW: MySQL Schema Creation** - Created complete MySQL-compatible schema with all tables, relationships, and data types properly converted
- **NEW: Database Export System** - Converted existing PostgreSQL data to MySQL format (6.54KB backup file generated)
- **NEW: MySQL Configuration Files** - Created drizzle.mysql.config.ts, server/mysql-db.ts, and shared/mysql-schema.ts for MySQL deployment
- **NEW: Automated Migration Scripts** - Built mysql-migration.sh and export-mysql-data.js for seamless database conversion
- **NEW: phpMyAdmin Setup Guide** - Created comprehensive documentation for database management via phpMyAdmin
- **ENHANCED: Server Deployment Support** - Added MYSQL_DEPLOYMENT_GUIDE.md with complete deployment instructions for MySQL servers
- **PRESERVED: All Functionality** - Patient management, appointment workflows, QR codes, medical records, and enhanced features fully operational with MySQL
- **COMPLETED: UI Consistency Update** - Applied same action buttons, layout, and display format from Patients module to Appointments module for unified interface design
- **NEW: Enhanced Appointments Layout** - Updated to match Patients card-style layout with larger avatars, improved spacing, and better information hierarchy
- **NEW: Unified Action Buttons** - Applied same status-based quick actions and comprehensive dropdown menus across both Patients and Appointments modules
- **NEW: Professional Card Design** - Consistent visual styling with hover effects, color-coded status badges, and improved typography across all modules
- **NEW: Appointment Action Handlers** - Complete set of action functions for check-in, consultation start, completion, cancellation, reschedule, and communication
- **ENHANCED: Appointment Report Generation** - Professional PDF reports with QR codes, medical branding, and comprehensive appointment details
- **NEW: Status-based Quick Actions** - Smart action buttons that appear based on appointment status (scheduled → check-in → start → complete)
- **ENHANCED: Patient QR Code positioning** - Repositioned QR code in print report header for better layout and professional appearance
- **NEW: Invoice QR code integration** - Added QR codes to all invoice templates for quick payment processing
- **IMPROVED: Print report header design** - Reduced header size, improved alignment, and enhanced visual hierarchy for professional medical reports
- **ENHANCED: Appointment management system** - Full functionality with status changes, action buttons, and comprehensive workflow management
- **NEW: Advanced appointment status tracking** - Added check-in, in-progress, completion, and cancellation status management
- **NEW: Real-time appointment data integration** - Connected appointment system to live database with fallback display options
- **ENHANCED: Action dropdown menus** - Comprehensive action buttons for view, edit, status changes, print, QR codes, sharing, and invoicing
- **IMPROVED: Professional medical interface** - Enhanced patient portal with proper medical practice workflow and documentation
- Added comprehensive toast notifications for all user actions
- Professional medical practice interface with proper authentication flow

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Middleware**: Express middleware for request logging, JSON parsing, and error handling
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (primary) / MySQL (deployment option)
- **ORM**: Drizzle ORM with dual database support
- **Connection**: Neon serverless PostgreSQL (development) / MySQL with connection pooling (production)
- **Migrations**: Drizzle Kit with separate configurations for each database
- **phpMyAdmin**: MySQL database management interface support

### Key Components & Features
- **Authentication System**: Replit OpenID Connect (OIDC) authentication with PostgreSQL-backed sessions and role-based access control (admin, manager, staff).
- **Data Models**: Comprehensive schema for Users, Stores, Products, Inventory, Customers, Sales, and Appointments.
- **Frontend Components**: Responsive layout, dedicated page components for core functions, reusable modals, form management with React Hook Form and Zod validation, and a comprehensive UI component library.
- **API Structure**: RESTful endpoints for CRUD operations across all entities, dashboard data, and authentication.
- **Business Operations Flow**: Frontend makes API requests using TanStack Query, processed by Express with Drizzle ORM for database interactions, returning JSON responses to automatically update the UI.
- **Real-time Updates**: Client-side query invalidation, optimistic updates, and background refetching.
- **Core Module Development**: Includes Store Management (CRUD), Inventory Management (catalog, stock, pricing), Sales Management (POS, transaction history, analytics), Customer Management (profiles, loyalty program), and Appointment Scheduling.
- **Medical Practice Management**: Comprehensive medical database schema for doctors, patients, medical appointments, prescriptions, treatments, and billing. Includes advanced prescription management and QR code generation for medical records.
- **Dashboard & Analytics**: Real-time KPI tracking, store performance comparison, inventory alerts, and recent activity.
- **Enhanced CRM Features**: SMTP Email Integration (e.g., SendGrid support), Cash Payment Support, Custom Fields System for all entities, and expanded payment methods (cash, card, check, digital).
- **Store Settings**: Comprehensive store-specific configuration including domain management, payment gateway (Stripe, PayPal), SMS gateway (Twilio, AWS SNS, Vonage, TextLocal), SMTP email setup, website settings (theme, branding, SEO, analytics).

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection.
- **drizzle-orm**: Type-safe database operations.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Headless UI components.
- **react-hook-form**: Form management with validation.
- **zod**: Schema validation and type generation.

### Authentication
- **openid-client**: OpenID Connect client implementation.
- **passport**: Authentication middleware.
- **express-session**: Session management.
- **connect-pg-simple**: PostgreSQL session store.

### Other
- **Recharts**: For interactive data visualization in reports.