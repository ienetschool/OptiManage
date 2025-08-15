# Complete Database Column Fix - All Missing Columns

## Issue Analysis
The previous command added some columns, but more are missing. Here's the complete list of missing columns from the error logs:

### Missing Columns Found:
- **patients table**: `blood_group`, `allergies`, `medical_history`, etc.
- **customers table**: `loyalty_tier`, `loyalty_points`
- **products table**: `cost_price`, `category_id`, `supplier_id`, etc.

## Complete Database Fix Command
Run this comprehensive command to add ALL missing columns:

```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
-- Products table missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id VARCHAR(36);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id VARCHAR(36);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 10;

-- Patients table missing columns  
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS previous_eye_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_eye_exam_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_prescription TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS risk_factors TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS family_medical_history TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS alcohol_consumption VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS exercise_frequency VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS right_eye_sphere DECIMAL(4,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS right_eye_cylinder DECIMAL(4,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS right_eye_axis INT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS left_eye_sphere DECIMAL(4,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS left_eye_cylinder DECIMAL(4,2);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS left_eye_axis INT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pupillary_distance DECIMAL(4,1);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS treatment_plan TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_alerts TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS nis_number VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_coupons TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;

-- Customers table missing columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

SHOW TABLES;
EOF"
```

## Domain Configuration Fix
Your application is running but the domain configuration needs to be fixed. Check these commands:

```bash
# Check if the application is accessible internally
ssh root@5.181.218.15 "curl -I http://localhost:8080"

# Check PM2 process details
ssh root@5.181.218.15 "pm2 show optistore-pro"

# Check if port 8080 is accessible
ssh root@5.181.218.15 "netstat -tlnp | grep :8080"
```

## Expected Results
After running the complete database fix:
- All database column errors will be resolved
- Patient, Product, and Customer pages will load without 500 errors
- The application should be fully functional

## Domain Access
Once database is fixed, your application should be accessible at:
- https://opt.vivaindia.com:8080 (if port access is enabled)
- Or may need domain/proxy configuration in Plesk