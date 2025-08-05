# OptiStore Pro - Multi-Store Management System

## Overview
OptiStore Pro is a comprehensive multi-store management system designed for optical retail businesses. It provides a centralized platform for managing multiple store locations, inventory, sales, appointments, and customer relationships. The application aims to streamline operations, enhance customer engagement, and provide valuable business insights. Key capabilities include centralized multi-store management, detailed patient medical profiles, advanced prescription history, professional billing and invoicing, medical document generation (PDF reports, QR codes), and a robust staff management module with payroll and document tracking. The system is designed to be production-ready, supporting a full range of business operations and offering a modern, user-friendly interface.

## Recent Updates (August 2025)
✅ **Complete Expenditure Tracking System Implemented (August 5, 2025)**: Successfully resolved expenditure data persistence issues by implementing database-backed expenditure storage. Product reorders now automatically create persistent expenditure records that survive server restarts. Enhanced accounting module with proper income vs expenditure categorization: Sales/Quick Sales/Appointments = Income, Inventory Purchases/Reorders = Expenditures. Payment system displays all transaction types with accurate profit/loss calculations.

✅ **Invoice Product ID Display Fixed (August 5, 2025)**: Completely resolved Product ID column showing "N/A" instead of actual database UUIDs. Invoice template now correctly displays authentic Product IDs: Ray-Ban@23225 (c33f14b5-b8c2-468b-afc2-d036ae58a2de), Ray-Ban9832 (b47a5663-7917-4076-b9d3-76f678ad5988), RayBan-3422 (0eed9a96-7226-4a02-adb0-b58c1870fdfb). All invoices now show real database-driven product identification for reliable business operations.

✅ **Critical Invoice Data Bug Fixed (August 5, 2025)**: Resolved persistent issue where invoice template route displayed hardcoded test data instead of real database values. Invoice INV-BULK-912170 now correctly shows Ray-Ban@23225 with authentic data: 2 units at $1,801.00 = $3,602.00 (previously showed incorrect 25 units at $120.00). All invoice routes now use database-driven data for reliable business operations.

✅ **Migration to Standard Replit Environment (August 4, 2025)**: Successfully migrated OptiStore Pro from Replit Agent to standard Replit environment. Set up PostgreSQL database with proper connection, installed all required dependencies (tsx, postgresql tools), imported complete database backup with all tables and data, and verified full application functionality.

✅ **Staff & HR Module Enhancements**: Completed comprehensive Staff & HR module with Access & Permissions tab featuring username auto-generation, enhanced Payroll & Documents tab with working hours management, and advanced Attendance system with manual entry and QR code scanning capabilities.

✅ **Communication Module**: Implemented full Communication Center with message templates, multi-recipient support, automatic message scheduling, and comprehensive message history tracking.

✅ **Notifications Module**: Created advanced Notifications Center with automatic notifications for all business events, configurable notification settings, priority-based filtering, and real-time notification management.

✅ **Enhanced Patients Module**: Added username/password fields with auto-generation for portal access credentials, maintaining existing comprehensive patient management features.

✅ **System Settings Enhancements**: Enhanced backup and recovery management with automatic backup details, download/restore functionality, backup history tracking, and import/export tools.

✅ **Page Editor Improvements**: Fixed scrolling functionality in the website page editor with proper container structure and overflow handling.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite
- **UI/UX Decisions**: Consistent card-style layouts, status badges, hover effects, professional medical formatting, responsive design, and unified action button systems across modules (e.g., Patients and Appointments). Large QR code sections were removed from patient view popups and compact QR codes added to headers for better layout.

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
- **Data Models**: Comprehensive schema for Users, Stores, Products, Inventory, Customers, Sales, Appointments, and medical-specific entities (doctors, patients, medical appointments, prescriptions, treatments, billing).
- **Frontend Components**: Responsive layout, dedicated page components for core functions, reusable modals, form management with React Hook Form and Zod validation, and a comprehensive UI component library.
- **API Structure**: RESTful endpoints for CRUD operations across all entities, dashboard data, and authentication.
- **Business Operations Flow**: Frontend makes API requests using TanStack Query, processed by Express with Drizzle ORM for database interactions, returning JSON responses to automatically update the UI.
- **Real-time Updates**: Client-side query invalidation, optimistic updates, and background refetching.
- **Core Module Development**: Includes Store Management (CRUD), Inventory Management (catalog, stock, pricing), Sales Management (POS, transaction history, analytics), Customer Management (profiles, loyalty program), and Appointment Scheduling.
- **Medical Practice Management**: Comprehensive medical database schema and workflows, including advanced prescription management, QR code generation for medical records, detailed patient medical profiles, and professional billing.
- **Dashboard & Analytics**: Real-time KPI tracking, store performance comparison, inventory alerts, and recent activity.
- **Enhanced CRM Features**: SMTP Email Integration, Cash Payment Support, Custom Fields System for all entities, and expanded payment methods (cash, card, check, digital). Comprehensive payment processing system with automatic invoice generation and doctor assignment logic based on payment status.
- **Store Settings**: Comprehensive store-specific configuration including domain management, payment gateway, SMS gateway, SMTP email setup, and website settings.
- **Website Management**: Professional visual page editor with comprehensive pagination (10/20/50 items per page), advanced filtering (status, type, search), bulk operations (publish, draft, delete), data sharing capabilities (JSON/CSV export, clipboard copy, share links), checkbox selection system, and enhanced page management interface with responsive design.

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