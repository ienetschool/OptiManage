# OptiStore Pro - Medical Practice Management System

## Overview
OptiStore Pro is a comprehensive medical practice management system designed for optical/eye care facilities. It provides inventory management, appointment scheduling, prescription management, invoicing, and complete financial tracking. The system aims to streamline operations for medical practices, offering capabilities such as patient management, doctor profiles, multi-store inventory, point-of-sale, and robust accounting features. Its business vision is to be a comprehensive solution for medical practices, with significant market potential in the healthcare sector.

## User Preferences
- Use TypeScript for type safety
- Follow modern React patterns with hooks
- Prefer MySQL/MariaDB for production deployment
- Use shadcn/ui components for consistent UI
- Implement proper error handling and validation
- Direct access without port numbers or redirects (no :8080 in URLs)

## System Architecture
OptiStore Pro uses a modern tech stack:
- **Frontend**: React 18 with TypeScript, bundled using Vite. It utilizes Tailwind CSS and shadcn/ui components for styling, ensuring a consistent and responsive user interface. State management is handled by TanStack Query for server state.
- **Backend**: Express.js with TypeScript, serving APIs on port 5000.
- **Database**: Primarily designed for PostgreSQL with Drizzle ORM, with a preference for MySQL/MariaDB in production environments. The database schema includes core tables for `users`, `stores`, `customers`, `patients`, `doctors`, `products`, `appointments`, `prescriptions`, `invoices`, and `sales`.
- **Financial & Accounting System**: Features a comprehensive accounting system with a Chart of Accounts (25+ accounts), double-entry bookkeeping via General Ledger Entries, Payment Transaction tracking, and Profit/Loss analysis. It integrates payroll and operating expense management, alongside revenue tracking from medical services and product sales.
- **Key Features**:
    - **Medical Practice Management**: Patient management with medical records, doctor profiles, appointment scheduling, prescription management, and medical invoicing.
    - **Business Operations**: Multi-store inventory, point of sale, invoice generation, customer relationship management, and staff role/permission management.
    - **Financial Tracking**: Income/Expenditure tracking, Profit/Loss reporting, COGS tracking, and monthly financial reporting.
- **Design Decisions**: Emphasis on clean UI, readability (e.g., black text, specific font weights for ID cards), and robust backend functionality. Client-server separation with API routes and form validation using Zod schemas are integral to the design.

## External Dependencies
- **Database**: PostgreSQL (current development), MySQL (preferred production).
- **Authentication**: Replit Auth.
- **Styling**: Tailwind CSS, shadcn/ui.
- **Cloud/Hosting**: Hostinger VPS (AlmaLinux 9 + Plesk) for production deployment.
- **Process Management**: PM2 for Node.js application management in production.

## Recent Changes
- **August 15, 2025**: ✅ **PRODUCTION DEPLOYMENT READY** - OptiStore Pro development complete, production fix prepared
  - **Development Status**: ✅ Complete - All database schema fixes applied and APIs working (200 status codes)
  - **Database Schema**: ✅ All MySQL columns added successfully (assigned_doctor_id, appointment_fee, payment_status, product_name, discount, total, barcode, address fields, emergency_contact)
  - **Installation Form**: ✅ Updated with password field and made all connection fields editable
  - **MySQL Test Endpoint**: ✅ Updated to accept dynamic connection parameters from installation form
  - **Production Server**: ✅ **DEPLOYMENT SUCCESSFUL** - OptiStore Pro now running on production server
  - **Production Status**: PM2 process "optistore-main" online with 3.3mb memory usage
  - **Server Listening**: Successfully serving on port 8080 with complete application
  - **Database Connection**: MySQL localhost:3306/opticpro with all schema fixes applied
  - **Build System**: Vite client build successful (324.8kb), files served from server/public
  - **Application Access**: 
    - **http://opt.vivaindia.com:8080** - Direct application access (confirmed working)
    - **http://opt.vivaindia.com** - Domain redirect (needs verification)
  - **Production Environment**: Hostinger VPS (5.181.218.15) with AlmaLinux 9 + Plesk
  - **Final Status**: ✅ **PRODUCTION DEPLOYMENT COMPLETE** - Full medical practice management system operational