# Final Production Setup - Application Running Successfully

## Current Status ✅
- **PM2 Application**: "optistore-pro" running successfully (37.6MB memory)
- **Server Path**: `/var/www/vhosts/vivaindia.com/opt.vivaindia.com/optistore-app`
- **Port**: Application running on port 8080
- **Health**: Application responding and stable

## Step 1: Complete Database Schema Fix
Run this command to add ALL missing database columns:

```bash
ssh root@5.181.218.15 "mysql -h localhost -u ledbpt_optie -p'g79h94LAP' opticpro << 'EOF'
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id VARCHAR(36);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id VARCHAR(36);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 10;
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
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
EOF"
```

## Step 2: Test Direct Port Access
After database fix, test these URLs:

```bash
# Test if port 8080 is accessible externally
curl -I http://5.181.218.15:8080

# Test direct domain with port
curl -I http://opt.vivaindia.com:8080
```

## Step 3: Domain Configuration Options

### Option A: Direct Port Access
If port 8080 is accessible, your application will be available at:
- **http://opt.vivaindia.com:8080**

### Option B: Plesk Proxy Setup (if port access blocked)
Configure Plesk to proxy traffic from port 80/443 to port 8080:

1. In Plesk control panel:
   - Go to "Websites & Domains" → opt.vivaindia.com
   - Click "Apache & nginx Settings"
   - Add proxy configuration to forward traffic to localhost:8080

2. Alternative: Create a simple redirect HTML file at document root pointing to :8080

## Expected Results
After database fix:
- ✅ All 500 errors resolved
- ✅ Patient management functional
- ✅ Product inventory working
- ✅ Customer records loading
- ✅ Complete medical practice dashboard operational

## Application Access
Your OptiStore Pro will be accessible at:
- **Primary**: http://opt.vivaindia.com:8080 (direct port access)
- **Alternative**: Requires Plesk proxy configuration for clean URL access

The application is running successfully - we just need to complete the database schema and configure domain access.