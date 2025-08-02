# OptiStore Pro - Database Backup Information

## Backup Created: August 2, 2025

### Database Schema Overview
- **Database Type**: PostgreSQL 16.9
- **Total Tables**: 33 tables
- **Backup File**: `database_backup_20250802_033702.sql` (91.2 KB)

### Key Tables and Data
1. **Core Business Tables**:
   - `customers` - Customer information and loyalty data
   - `stores` - Store locations and configurations
   - `products` - Product catalog and inventory
   - `sales` - Sales transactions and items
   - `appointments` - Appointment scheduling

2. **Medical Practice Tables**:
   - `patients` - Patient medical records and history
   - `doctors` - Doctor profiles and specializations
   - `prescriptions` - Prescription details and vision parameters
   - `medical_appointments` - Medical consultation appointments
   - `medical_invoices` - Medical billing and invoices

3. **HR & Staff Management**:
   - `staff` - Staff information and roles
   - `attendance` - Staff attendance tracking
   - `payroll` - Payroll processing and records
   - `leave_requests` - Leave management system

4. **System & Configuration**:
   - `users` - User authentication and sessions
   - `notifications` - System notifications
   - `email_templates` - Email communication templates
   - `role_permissions` - Role-based access control

### Backup Features
✅ **Complete Schema Structure** - All tables, constraints, and indexes
✅ **Full Data Export** - All customer, medical, and business data
✅ **Relationship Integrity** - Foreign key constraints preserved
✅ **Custom Fields Support** - JSONB fields for flexible data storage
✅ **QR Code Integration** - QR codes for medical records and staff tracking

### Current Data Status
- **Live Patient Records**: Active patient database with medical history
- **Real Invoice Transactions**: $421.25 in payment transactions
- **Active Appointments**: Multiple scheduled appointments with fee tracking
- **Comprehensive Medical Data**: Prescriptions, doctor notes, and treatments

### Backup File Information
- **Primary Backup**: `database_backup_20250802_033702.sql`
- **Previous Backups**: 
  - `database_backup_20250801_145407.sql` (56.1 KB)
  - `database_backup_20250731_172049.sql` (54.6 KB)
- **MySQL Compatible**: `mysql_database_backup_complete.sql` (6.7 KB)

### Restoration Instructions
1. **PostgreSQL Restoration**:
   ```bash
   psql $DATABASE_URL < database_backup_20250802_033702.sql
   ```

2. **MySQL Migration** (if needed):
   ```bash
   mysql -u username -p database_name < mysql_database_backup_complete.sql
   ```

### Notes
- All sensitive data is preserved with proper authentication
- Medical records comply with patient privacy standards  
- Payment and billing data is accurately maintained
- Staff and HR records are complete with QR code generation