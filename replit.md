# OptiStore Pro - Multi-Store Management System

## Overview
OptiStore Pro is a comprehensive multi-store management system designed for optical retail businesses. It provides a centralized platform for managing multiple store locations, inventory, sales, appointments, and customer relationships. The application aims to streamline operations, enhance customer engagement, and provide valuable business insights. Key capabilities include centralized multi-store management, detailed patient medical profiles, advanced prescription history, professional billing and invoicing, medical document generation (PDF reports, QR codes), and a robust staff management module with payroll and document tracking. The system is designed to be production-ready, supporting a full range of business operations and offering a modern, user-friendly interface.

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