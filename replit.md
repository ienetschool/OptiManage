# OptiStore Pro - Multi-Store Management System

## Overview

OptiStore Pro is a comprehensive multi-store management system designed for optical retail businesses. The application provides a centralized platform for managing multiple store locations, inventory, sales, appointments, and customer relationships. Built with a modern full-stack architecture, it combines a React frontend with an Express.js backend, using PostgreSQL for data persistence and Replit authentication for secure user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Middleware**: Express middleware for request logging, JSON parsing, and error handling
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for schema management
- **Schema**: Comprehensive relational schema supporting multi-store operations

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure session handling

### Data Models
The system implements a comprehensive schema with the following core entities:
- **Users**: Staff management with role-based access (admin, manager, staff)
- **Stores**: Multiple location management with full address and contact information
- **Products**: Comprehensive product catalog with categories and suppliers
- **Inventory**: Store-specific inventory tracking with stock levels
- **Customers**: Customer profiles with contact information and loyalty tracking
- **Sales**: Transaction management with line items and payment tracking
- **Appointments**: Scheduling system with customer and store associations

### Frontend Components
- **Layout System**: Responsive sidebar navigation with header components
- **Page Components**: Dedicated pages for each major system function
- **Modal System**: Reusable modals for notifications and quick actions
- **Form Management**: React Hook Form with Zod validation
- **UI Components**: Comprehensive component library based on Radix UI

### API Structure
- **Authentication Routes**: Login, logout, and user profile endpoints
- **CRUD Operations**: Full create, read, update, delete operations for all entities
- **Dashboard Endpoints**: Aggregated data for KPIs and business metrics
- **Validation**: Zod schema validation for all API inputs

## Data Flow

### Authentication Flow
1. User accesses the application
2. Replit OIDC redirects to authentication provider
3. Successful authentication creates/updates user session
4. Session stored in PostgreSQL with automatic expiration
5. Frontend receives user data and renders authenticated interface

### Business Operations Flow
1. Frontend components make API requests using TanStack Query
2. Express middleware handles request validation and authentication
3. Database operations performed through Drizzle ORM
4. Results returned as JSON with appropriate HTTP status codes
5. Frontend automatically updates UI based on server responses

### Real-time Updates
- Client-side query invalidation for immediate UI updates
- Optimistic updates for improved user experience
- Background refetching for data consistency

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form management with validation
- **zod**: Schema validation and type generation

### Authentication
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Type safety and developer experience
- **tailwindcss**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js with tsx for TypeScript execution
- **Database**: Neon PostgreSQL with environment-based configuration
- **Hot Reloading**: Vite development server with HMR
- **Development Tools**: Replit-specific plugins for enhanced development experience

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: esbuild compilation to ESM format
- **Database**: Drizzle migrations for schema deployment
- **Environment**: Environment variable configuration for database and authentication

### Build Process
1. TypeScript compilation and type checking
2. Frontend asset bundling and optimization
3. Backend compilation to production-ready JavaScript
4. Database schema deployment through migrations
5. Static asset serving through Express in production

The system is designed to scale across multiple store locations while maintaining centralized management capabilities. The architecture supports role-based access control, multi-tenant data isolation, and comprehensive business intelligence through the dashboard system.