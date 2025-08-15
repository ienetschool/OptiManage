# Nginx Configuration Analysis and Database Fix

## Current Status
✅ **Nginx Configuration Updated**: I can see you've applied the improved proxy configuration
✅ **PM2 Application**: Running and responding on port 8080
⚠️ **Issue**: Still need to create missing database tables

## Database Fix Command
Run this to create the missing tables and complete the schema:

```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) PRIMARY KEY,
    staff_code VARCHAR(50),
    employee_id VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    position VARCHAR(100),
    department VARCHAR(100),
    store_id VARCHAR(36),
    manager_id VARCHAR(36),
    hire_date DATE,
    termination_date DATE,
    status VARCHAR(20),
    role VARCHAR(50),
    permissions TEXT,
    username VARCHAR(50),
    password VARCHAR(255),
    minimum_working_hours INT,
    daily_working_hours INT,
    blood_group VARCHAR(10),
    staff_photo TEXT,
    documents TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    avatar TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    custom_fields TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50),
    patient_id VARCHAR(36),
    doctor_id VARCHAR(36),
    appointment_id VARCHAR(36),
    prescription_id VARCHAR(36),
    store_id VARCHAR(36),
    invoice_date DATE,
    due_date DATE,
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    total DECIMAL(10,2),
    payment_status VARCHAR(20),
    payment_method VARCHAR(50),
    payment_date DATE,
    applied_coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2),
    coupon_type VARCHAR(20),
    coupon_description TEXT,
    notes TEXT,
    qr_code TEXT,
    custom_fields TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS applied_coupon_code VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_type VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_description TEXT;

INSERT IGNORE INTO staff (id, staff_code, first_name, last_name, email, position, status, role) 
VALUES ('staff001', 'STF001', 'John', 'Admin', 'admin@optistore.com', 'Manager', 'active', 'admin');

SELECT 'Database setup complete' as status;
EOF"
```

## Next Steps
After running the database command:

1. **Apply the nginx configuration** (click OK/Apply in Plesk)
2. **Test the website**: Visit https://opt.vivaindia.com
3. **Verify functionality**: Check patient management, products, staff sections

## Expected Result
- All database tables will exist
- All API endpoints will respond without 500 errors
- OptiStore Pro medical practice dashboard will load completely
- Website will be accessible at https://opt.vivaindia.com with SSL

The nginx proxy configuration looks correct - it should forward all traffic to your PM2 application on localhost:8080.