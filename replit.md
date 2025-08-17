# OptiStore Pro - Medical Practice Management System

## Overview
OptiStore Pro is a comprehensive medical practice management system for optical/eye care facilities. It streamlines operations by offering inventory management, appointment scheduling, prescription management, invoicing, and complete financial tracking. Key capabilities include patient management, doctor profiles, multi-store inventory, point-of-sale, and robust accounting features. Its vision is to be a holistic solution for medical practices, leveraging significant market potential in the healthcare sector.

## User Preferences
- Use TypeScript for type safety
- Follow modern React patterns with hooks
- Prefer MySQL/MariaDB for production deployment
- Use shadcn/ui components for consistent UI
- Implement proper error handling and validation
- Direct access without port numbers or redirects (no :8080 in URLs)

## System Architecture
OptiStore Pro utilizes a modern tech stack and architectural patterns:
- **Frontend**: React 18 with TypeScript and Vite. Styling is handled by Tailwind CSS and shadcn/ui components for a consistent, responsive UI. State management uses TanStack Query.
- **Backend**: Express.js with TypeScript, serving APIs.
- **Database**: Designed for PostgreSQL with Drizzle ORM, with a strong preference for MySQL/MariaDB in production. The schema supports core entities like `users`, `stores`, `customers`, `patients`, `doctors`, `products`, `appointments`, `prescriptions`, `invoices`, and `sales`.
- **Financial & Accounting System**: Features a comprehensive accounting module with Chart of Accounts (25+ accounts), double-entry bookkeeping via General Ledger Entries, Payment Transaction tracking, and Profit/Loss analysis. It integrates payroll, operating expense management, and revenue tracking.
- **Key Features**:
    - **August 17, 2025 - NAVIGATION SIDEBAR ISSUE**: Persistent Patient Management sidebar issue showing only 2 of 5 menu items despite multiple fix attempts. Created new SidebarForced.tsx component to bypass rendering issues. Original sidebar had component resolution/caching problems preventing all navigation items from displaying properly.
    - **Medical Practice Management**: Patient management with medical records, doctor profiles, appointment scheduling, prescription management, and medical invoicing. Includes a comprehensive 7-step lens prescription and specs order management workflow with integrated database tables (e.g., `lens_prescriptions`, `specs_orders`, `lens_cutting_tasks`, `deliveries`, `workflow_notifications`), real-time tracking, and automated notifications.
    - **Business Operations**: Multi-store inventory, point of sale, invoice generation, customer relationship management, and staff role/permission management.
    - **Financial Tracking**: Income/Expenditure tracking, Profit/Loss reporting, COGS tracking, and monthly financial reporting.
- **Design Decisions**: Emphasis on clean UI, readability, and robust backend functionality. Utilizes client-server separation with API routes and form validation using Zod schemas. Comprehensive form enhancement with multi-step wizards and `useFormValidation` hook for step-by-step validation.

## External Dependencies
- **Database**: MySQL unified database: `mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro`
- **Authentication**: Replit Auth.
- **Styling**: Tailwind CSS, shadcn/ui.
- **Cloud/Hosting**: Hostinger VPS (AlmaLinux 9 + Plesk).
- **Process Management**: PM2 for Node.js application management.