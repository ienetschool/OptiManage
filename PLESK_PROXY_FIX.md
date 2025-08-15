# Plesk Configuration Fix - Correct Path

## Issue Identified
Your Plesk Node.js application is configured but pointing to the wrong directory:
- **Current Document Root**: `/opt.vivaindia.sql`
- **Should be**: Where your PM2 application is actually running

## Step 1: Database Fix (Complete All Missing Columns)
First, let's fix all database issues:

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
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_type VARCHAR(50);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS visual_acuity_right_eye VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS visual_acuity_left_eye VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sphere_right DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS cylinder_right DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS axis_right INT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS add_right DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sphere_left DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS cylinder_left DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS axis_left INT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS add_left DECIMAL(4,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pd_distance DECIMAL(4,1);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pd_near DECIMAL(4,1);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pd_far DECIMAL(4,1);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS treatment TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS advice TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS next_follow_up DATE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS status VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);
EOF"
```

## Step 2: Find Actual Application Path
```bash
ssh root@5.181.218.15 "pm2 show optistore-pro | grep 'script path'"
```

## Step 3: Plesk Node.js Configuration Options

### Option A: Update Plesk Application Root
1. In Plesk → opt.vivaindia.com → Node.js
2. Change **Application Root** to the actual directory where your PM2 app is running
3. Update **Application URL** if needed
4. Restart the Node.js application in Plesk

### Option B: Use PM2 with Plesk Proxy
1. Keep PM2 running on port 8080
2. Configure Plesk to proxy traffic to localhost:8080
3. Add this to Apache & nginx Settings:

**Additional nginx directives:**
```
location / {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Step 4: Test Access
After configuration:
- **HTTPS**: https://opt.vivaindia.com (should work with SSL)
- **Direct**: http://opt.vivaindia.com:8080 (if port access enabled)

## Expected Result
Your OptiStore Pro medical practice management system will be accessible at the clean domain URL without port numbers, with all database errors resolved.