# ByteRover Handbook - OptiStore Pro

*Generated: 2025-01-09*
*Project: Multi-Store Optical Management System*

## Layer 1: System Overview

### Purpose
OptiStore Pro is a comprehensive optical store management system designed for modern optical retail businesses. It provides advanced inventory management, professional invoicing, medical practice integration, and multi-store operations management.

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL/MySQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js (Google OAuth, Apple, Twitter)
- **UI Components**: shadcn/ui, Radix UI primitives
- **PDF Generation**: PDFKit, jsPDF, html2canvas
- **QR Codes**: React QR Code generation
- **Payment Processing**: Stripe integration
- **Email**: SendGrid integration
- **Build Tools**: Vite, esbuild, TypeScript

### Architecture Pattern
**Full-Stack Monorepo with Client-Server Separation**
- Monolithic Express.js backend with modular route organization
- React SPA frontend with component-based architecture
- Shared schema definitions between client and server
- RESTful API design with Express routers
- Session-based authentication with multiple OAuth providers

### Key Technical Decisions
- **Database Flexibility**: Supports both PostgreSQL and MySQL via Drizzle ORM
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Component Library**: Radix UI for accessibility and shadcn/ui for design system
- **Build Strategy**: Vite for frontend, esbuild for backend bundling
- **Authentication**: Multi-provider OAuth with session management

## Layer 2: Module Map

### Core Modules

#### 1. **Medical Management** (`server/medicalRoutes.ts`, `client/src/pages/MedicalRecords.tsx`)
- **Responsibility**: Patient records, appointments, prescriptions, medical history
- **Key Features**: Patient registration, appointment scheduling, prescription tracking
- **Database Tables**: patients, doctors, appointments, prescriptions, medical_records

#### 2. **Inventory Management** (`client/src/pages/InventoryModern.tsx`)
- **Responsibility**: Product catalog, stock tracking, barcode management
- **Key Features**: Real-time stock monitoring, barcode generation, purchase orders
- **Database Tables**: products, inventory, stock_movements, purchase_orders

#### 3. **Invoicing & Billing** (`client/src/components/*InvoiceTemplate.tsx`)
- **Responsibility**: Professional invoice generation, payment processing
- **Key Features**: A4 format templates, PDF generation, multi-payment support
- **Components**: A4InvoiceTemplate, ModernA4InvoiceTemplate, ProfessionalInvoice

#### 4. **Specs Workflow** (`server/specsOrderRoutes.ts`, `client/src/pages/SpecsWorkflow.tsx`)
- **Responsibility**: Lens cutting workflow, order management, delivery tracking
- **Key Features**: Order creation, task management, workflow notifications
- **Database Tables**: specs_orders, lens_cutting_tasks, deliveries, workflow_notifications

#### 5. **Analytics & Reporting** (`server/routes/analyticsRoutes.ts`)
- **Responsibility**: Business intelligence, performance metrics, custom reports
- **Key Features**: Sales analytics, patient analytics, inventory analytics, financial reports
- **Types**: Sales, patients, inventory, financial, staff analytics

### Data Layer

#### **Database Abstraction** (`server/db.ts`, `shared/mysql-schema.ts`)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Multi-Database**: PostgreSQL and MySQL support
- **Schema Management**: Shared schema definitions between client and server
- **Migration**: Drizzle Kit for database migrations

#### **Authentication Layer** (`server/oauthAuth.ts`, `server/simpleAuth.ts`)
- **Session Management**: Express sessions with multiple storage options
- **OAuth Providers**: Google, Apple, Twitter integration
- **Authorization**: Route-level authentication middleware
- **User Management**: Profile management and role-based access

### Utilities

#### **UI Components** (`client/src/components/ui/`)
- **Design System**: shadcn/ui components with Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA-compliant components from Radix UI

#### **Form Management** (`client/src/hooks/use-form-validation.ts`)
- **Validation**: Zod schema validation with React Hook Form
- **Type Safety**: Full TypeScript integration for form handling

## Layer 3: Integration Guide

### API Endpoints

#### **Medical Routes** (`/api/doctors`, `/api/patients`, `/api/appointments`)
```typescript
GET /api/doctors - Fetch all doctors
POST /api/doctors - Create new doctor
GET /api/patients - Fetch all patients  
POST /api/patients - Register new patient (public endpoint)
GET /api/appointments - Fetch appointments
POST /api/appointments - Create appointment
```

#### **Specs Workflow** (`/api/specs-orders/*`)
```typescript
GET /api/specs-orders - Get all specs orders
POST /api/specs-orders - Create new specs order
GET /api/specs-orders/dashboard - Dashboard statistics
GET /api/workflow/:orderId - Get workflow data
```

#### **Analytics** (`/api/analytics/*`)
```typescript
GET /api/analytics/advanced?type={sales|patients|inventory|financial|staff}
GET /api/analytics/export - Export analytics data
```

#### **Installation** (`/api/install/*`)
```typescript
POST /api/install/test-connection - Test database connection
POST /api/install/setup - Setup database and initial data
```

### Configuration Files

#### **Database Configuration**
- `drizzle.config.ts` - Drizzle ORM configuration
- `drizzle.mysql.config.ts` - MySQL-specific configuration
- `server/db.ts` - Database connection setup

#### **Build Configuration**
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration

#### **Deployment Configuration**
- `ecosystem.config.js` - PM2 process management
- `nginx_optistore.conf` - Nginx proxy configuration
- Various deployment scripts in root directory

### External Dependencies

#### **Payment Processing**
- **Stripe**: Payment processing with React Stripe.js integration
- **Configuration**: Stripe publishable and secret keys

#### **Email Services**
- **SendGrid**: Email delivery service
- **Usage**: Appointment notifications, invoice delivery

#### **Authentication Providers**
- **Google OAuth 2.0**: Primary authentication method
- **Apple Sign In**: iOS/macOS integration
- **Twitter OAuth**: Social authentication option

## Layer 4: Extension Points

### Design Patterns

#### **Router Pattern** (Express.js)
```typescript
// Modular route organization
const router = Router();
router.get('/api/endpoint', middleware, handler);
export default router;
```

#### **Schema-First Development** (Drizzle + Zod)
```typescript
// Shared schema definitions
export const patientSchema = z.object({
  name: z.string(),
  email: z.string().email()
});
```

#### **Component Composition** (React + Radix UI)
```typescript
// Composable UI components
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>
```

### Customization Areas

#### **Invoice Templates**
- **Location**: `client/src/components/*InvoiceTemplate.tsx`
- **Customization**: Layout, styling, fields, branding
- **Pattern**: Template component with props for data injection

#### **Authentication Providers**
- **Location**: `server/oauthAuth.ts`
- **Extension**: Add new OAuth providers via Passport.js strategies
- **Pattern**: Strategy pattern with provider-specific configurations

#### **Analytics Types**
- **Location**: `server/routes/analyticsRoutes.ts`
- **Extension**: Add new analytics types in switch statement
- **Pattern**: Strategy pattern with type-specific data fetching

#### **Database Adapters**
- **Location**: `server/db.ts`, schema files
- **Extension**: Add new database providers via Drizzle adapters
- **Pattern**: Adapter pattern with provider-specific configurations

### Plugin Architecture

#### **Route Registration**
```typescript
// server/routes.ts - Central route registration
export async function registerRoutes(app: Express) {
  registerMedicalRoutes(app);
  registerAnalyticsRoutes(app);
  // Add new route modules here
}
```

#### **Component Registration**
```typescript
// client/src/App.tsx - Route-based component loading
<Route path="/new-feature" component={NewFeatureComponent} />
```

### Recent Changes & Evolution
- **MySQL Migration**: Added MySQL support alongside PostgreSQL
- **Enhanced Authentication**: Multiple OAuth provider support
- **Responsive Design**: Mobile-first UI improvements
- **Analytics Enhancement**: Advanced reporting capabilities
- **Deployment Automation**: PM2 and Nginx configuration scripts

### Development Workflow
1. **Schema Definition**: Define database schema in `shared/` directory
2. **API Development**: Create routes in `server/routes/` or dedicated route files
3. **Frontend Integration**: Build React components consuming the APIs
4. **Type Safety**: Ensure TypeScript types are shared between layers
5. **Testing**: Use built-in development server for rapid iteration

---

*This handbook provides a comprehensive overview of the OptiStore Pro codebase architecture, designed to help developers quickly understand and contribute to the system.*