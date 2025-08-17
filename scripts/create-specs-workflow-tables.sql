-- Comprehensive 7-Step Lens Prescription and Specs Order Management Workflow
-- Database Schema Creation Script for OptiStore Pro

-- 1. Lens Prescriptions Table
CREATE TABLE IF NOT EXISTS lens_prescriptions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  patient_id VARCHAR(36) NOT NULL,
  doctor_id VARCHAR(36) NOT NULL,
  prescription_date DATE NOT NULL,
  
  -- Right Eye Prescription
  right_eye_sph DECIMAL(4,2) COMMENT 'Sphere power',
  right_eye_cyl DECIMAL(4,2) COMMENT 'Cylinder power',
  right_eye_axis INT COMMENT 'Axis (0-180 degrees)',
  right_eye_add DECIMAL(3,2) COMMENT 'Addition power for reading',
  
  -- Left Eye Prescription
  left_eye_sph DECIMAL(4,2) COMMENT 'Sphere power',
  left_eye_cyl DECIMAL(4,2) COMMENT 'Cylinder power',
  left_eye_axis INT COMMENT 'Axis (0-180 degrees)',
  left_eye_add DECIMAL(3,2) COMMENT 'Addition power for reading',
  
  -- Additional Measurements
  pupillary_distance DECIMAL(4,1) COMMENT 'Pupillary Distance in mm',
  
  -- Lens Specifications
  lens_type VARCHAR(50) NOT NULL COMMENT 'Single Vision, Bifocal, Progressive, etc.',
  lens_material VARCHAR(50) NOT NULL COMMENT 'CR-39, Polycarbonate, High Index, etc.',
  
  -- Recommendations and Instructions
  frame_recommendation TEXT COMMENT 'Doctor frame recommendations',
  coatings TEXT COMMENT 'Anti-glare, UV protection, etc.',
  tints VARCHAR(100) COMMENT 'Gray, brown, photochromic, etc.',
  special_instructions TEXT COMMENT 'Any special requirements',
  
  -- Workflow Status
  status VARCHAR(30) DEFAULT 'prescribed' COMMENT 'prescribed, order_created, in_progress, completed',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_patient_id (patient_id),
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_prescription_date (prescription_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Doctor lens prescriptions with detailed eye measurements and specifications';

-- 2. Specs Orders Table (Sales Invoice-like)
CREATE TABLE IF NOT EXISTS specs_orders (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  lens_prescription_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  store_id VARCHAR(36) NOT NULL,
  
  -- Frame Details
  frame_id VARCHAR(36) COMMENT 'Reference to products table',
  frame_name VARCHAR(255),
  frame_price DECIMAL(10,2),
  
  -- Pricing Breakdown
  lens_price DECIMAL(10,2) NOT NULL,
  coating_price DECIMAL(10,2) DEFAULT 0.00,
  additional_charges DECIMAL(10,2) DEFAULT 0.00,
  
  -- Financial Totals
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0.00,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Workflow Management
  status VARCHAR(30) DEFAULT 'draft' COMMENT 'draft, confirmed, assigned, in_progress, completed, delivered',
  priority VARCHAR(20) DEFAULT 'normal' COMMENT 'urgent, high, normal, low',
  
  -- Important Dates
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_delivery DATE,
  actual_delivery DATE,
  
  -- Notes and Communications
  order_notes TEXT COMMENT 'Customer visible notes',
  internal_notes TEXT COMMENT 'Internal staff notes',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_order_number (order_number),
  INDEX idx_lens_prescription_id (lens_prescription_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_store_id (store_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_order_date (order_date),
  INDEX idx_expected_delivery (expected_delivery)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Specs orders with comprehensive workflow management and pricing';

-- 3. Lens Cutting Tasks Table (Fitter Assignment)
CREATE TABLE IF NOT EXISTS lens_cutting_tasks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  specs_order_id VARCHAR(36) NOT NULL,
  assigned_to_fitter_id VARCHAR(36) COMMENT 'Staff member responsible for cutting',
  assigned_by_user_id VARCHAR(36) NOT NULL,
  
  -- Task Details
  task_type VARCHAR(50) DEFAULT 'lens_cutting' COMMENT 'lens_cutting, frame_fitting, adjustment',
  frame_size VARCHAR(100) COMMENT 'Frame measurements for cutting',
  special_instructions TEXT,
  estimated_time INT COMMENT 'Estimated completion time in minutes',
  
  -- Progress Tracking
  status VARCHAR(30) DEFAULT 'assigned' COMMENT 'assigned, in_progress, completed, quality_check, sent_to_store',
  progress INT DEFAULT 0 COMMENT 'Completion percentage 0-100',
  
  -- Timeline Management
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  deadline TIMESTAMP,
  
  -- Work Documentation
  work_remarks TEXT COMMENT 'Work progress notes',
  quality_check_notes TEXT COMMENT 'Quality assurance notes',
  work_photos TEXT COMMENT 'JSON array of photo URLs',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_specs_order_id (specs_order_id),
  INDEX idx_assigned_to_fitter_id (assigned_to_fitter_id),
  INDEX idx_assigned_by_user_id (assigned_by_user_id),
  INDEX idx_status (status),
  INDEX idx_assigned_date (assigned_date),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Lens cutting and fitting task assignments with progress tracking';

-- 4. Deliveries Table (Final Delivery Management)
CREATE TABLE IF NOT EXISTS deliveries (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  specs_order_id VARCHAR(36) NOT NULL,
  patient_id VARCHAR(36) NOT NULL,
  store_id VARCHAR(36) NOT NULL,
  
  -- Delivery Configuration
  delivery_method VARCHAR(30) NOT NULL COMMENT 'pickup, courier, home_delivery',
  delivery_address TEXT,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  
  -- Shipping and Tracking
  status VARCHAR(30) DEFAULT 'ready' COMMENT 'ready, out_for_delivery, delivered, failed',
  tracking_number VARCHAR(100),
  courier_service VARCHAR(100),
  
  -- Timeline
  ready_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_date DATE,
  delivered_date TIMESTAMP,
  
  -- Customer Experience
  delivery_notes TEXT,
  customer_feedback TEXT,
  delivery_rating INT COMMENT '1-5 star rating',
  
  -- Quality Assurance
  final_quality_check BOOLEAN DEFAULT FALSE,
  final_check_by VARCHAR(36),
  final_check_date TIMESTAMP,
  final_check_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_specs_order_id (specs_order_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_store_id (store_id),
  INDEX idx_status (status),
  INDEX idx_delivery_method (delivery_method),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_delivered_date (delivered_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Delivery management with customer feedback and quality assurance';

-- 5. Workflow Notifications Table
CREATE TABLE IF NOT EXISTS workflow_notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  type VARCHAR(50) NOT NULL COMMENT 'lens_cutting_assigned, task_completed, ready_for_delivery, delivered',
  recipient_type VARCHAR(30) NOT NULL COMMENT 'fitter, store, patient, admin, doctor',
  recipient_id VARCHAR(36),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  
  -- Related Workflow Entities
  specs_order_id VARCHAR(36),
  lens_cutting_task_id VARCHAR(36),
  delivery_id VARCHAR(36),
  
  -- Notification Content
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery Status
  status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, sent, failed',
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  
  -- Communication Channels
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_type (type),
  INDEX idx_recipient_type (recipient_type),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_status (status),
  INDEX idx_specs_order_id (specs_order_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Automated workflow notifications for all stakeholders';

-- Sample data insertion for testing the comprehensive workflow

-- Insert sample lens prescription
INSERT IGNORE INTO lens_prescriptions (
  id, patient_id, doctor_id, prescription_date,
  right_eye_sph, right_eye_cyl, right_eye_axis, right_eye_add,
  left_eye_sph, left_eye_cyl, left_eye_axis, left_eye_add,
  pupillary_distance, lens_type, lens_material,
  frame_recommendation, coatings, special_instructions, status
) VALUES (
  UUID(), '137f0191-7a43-11f0-a28c-4ce8d4b38425', 'doc001', '2025-01-15',
  -2.50, -1.00, 90, 2.00,
  -2.75, -0.75, 85, 2.00,
  62.0, 'Progressive', 'High Index 1.67',
  'Recommend full-rim frames for stability with progressive lenses',
  'Anti-glare coating, UV protection', 'Patient prefers lightweight frames', 'prescribed'
);

-- Insert sample specs order
INSERT IGNORE INTO specs_orders (
  id, order_number, lens_prescription_id, patient_id, store_id,
  frame_name, frame_price, lens_price, coating_price,
  subtotal, tax, total_amount, status, priority,
  expected_delivery, order_notes
) VALUES (
  UUID(), 'SPO250115001', 
  (SELECT id FROM lens_prescriptions LIMIT 1),
  '137f0191-7a43-11f0-a28c-4ce8d4b38425', 'store001',
  'Ray-Ban Progressive Classic', 150.00, 200.00, 50.00,
  400.00, 20.00, 420.00, 'confirmed', 'normal',
  '2025-01-22', 'Progressive lenses with anti-glare coating'
);

-- Show success message
SELECT 'Comprehensive 7-Step Lens Prescription & Specs Order Workflow Schema Created Successfully!' as message,
       'Tables: lens_prescriptions, specs_orders, lens_cutting_tasks, deliveries, workflow_notifications' as tables_created,
       'Features: Complete prescription management, order workflow, task assignment, delivery tracking, notifications' as features;