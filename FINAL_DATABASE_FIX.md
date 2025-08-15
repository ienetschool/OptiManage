# Final Database Fix - Missing Tables and Columns

## Issue Analysis
The application is running but missing several database tables and columns:

### Missing Tables:
- `staff` table (for employee management)
- `medical_invoices` table (for medical billing)

### Missing Columns:
- `invoices` table: missing `date` column
- Other tables may have additional missing fields

## Complete Database Creation and Fix Command

Run this comprehensive command to create missing tables and add all missing columns:

```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
-- Create missing staff table
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

-- Create missing medical_invoices table
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

-- Fix missing columns in invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS applied_coupon_code VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_type VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_description TEXT;

-- Insert sample staff member
INSERT IGNORE INTO staff (id, staff_code, first_name, last_name, email, position, status, role) 
VALUES ('staff001', 'STF001', 'John', 'Admin', 'admin@optistore.com', 'Manager', 'active', 'admin');

SHOW TABLES;
EOF"
```

## Domain Proxy Fix
Your nginx proxy may need adjustment. Check these steps:

### Step 1: Verify PM2 Application Port
```bash
ssh root@5.181.218.15 "pm2 show optistore-pro"
```

### Step 2: Test Direct Port Access
```bash
ssh root@5.181.218.15 "curl -I http://localhost:8080"
```

### Step 3: Alternative Nginx Configuration
If the current proxy isn't working, try this configuration in Plesk:

```nginx
location / {
    try_files $uri $uri/ @proxy;
}

location @proxy {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
}
```

## Expected Results
After running the database command:
- All missing tables will be created
- All missing columns will be added
- Staff management will be functional
- Medical invoices will work
- All 500 errors should be resolved

The website should then load properly at https://opt.vivaindia.com