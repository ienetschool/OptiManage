# OptiStore Pro - Multi-Store Management System

## Overview
OptiStore Pro is a comprehensive multi-store management system designed for optical retail businesses. It provides a centralized platform for managing multiple store locations, inventory, sales, appointments, and customer relationships. The application aims to streamline operations, enhance customer engagement, and provide valuable business insights through a modern full-stack architecture.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates (August 1, 2025)
- **ENHANCED: Patient QR Code positioning** - Repositioned QR code in print report header for better layout and professional appearance
- **NEW: Invoice QR code integration** - Added QR codes to all invoice templates for quick payment processing
- **IMPROVED: Print report header design** - Reduced header size, improved alignment, and enhanced visual hierarchy for professional medical reports
- **ENHANCED: Appointment management system** - Full functionality with status changes, action buttons, and comprehensive workflow management
- **NEW: Advanced appointment status tracking** - Added check-in, in-progress, completion, and cancellation status management
- **NEW: Real-time appointment data integration** - Connected appointment system to live database with fallback display options
- **ENHANCED: Action dropdown menus** - Comprehensive action buttons for view, edit, status changes, print, QR codes, sharing, and invoicing
- **IMPROVED: Professional medical interface** - Enhanced patient portal with proper medical practice workflow and documentation
- **NEW: Status-based quick actions** - Smart action buttons that appear based on appointment status (scheduled → check-in → start → complete)
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
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit

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