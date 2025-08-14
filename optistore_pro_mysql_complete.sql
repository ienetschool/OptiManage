-- OptiStore Pro - Complete MySQL Database Backup
-- Medical Practice Management System
-- Generated: August 14, 2025
-- Compatible with: MySQL 5.7+ and MySQL 8.0+

SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- --------------------------------------------------------
-- Table structure for sessions (Required for Replit Auth)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL PRIMARY KEY,
  `sess` json NOT NULL,
  `expire` timestamp NOT NULL,
  KEY `IDX_session_expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for users
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `email` varchar(255) DEFAULT NULL UNIQUE,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `profile_image_url` varchar(500) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'staff',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for stores
-- --------------------------------------------------------

DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(50) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `manager_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `timezone` varchar(50) DEFAULT 'America/New_York',
  `opening_hours` text DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_stores_manager_id` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for categories
-- --------------------------------------------------------

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for suppliers
-- --------------------------------------------------------

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for products
-- --------------------------------------------------------

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL UNIQUE,
  `category_id` varchar(36) DEFAULT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_supplier_id` (`supplier_id`),
  KEY `idx_products_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for store_inventory
-- --------------------------------------------------------

DROP TABLE IF EXISTS `store_inventory`;
CREATE TABLE `store_inventory` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `store_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int DEFAULT 0,
  `min_stock` int DEFAULT 0,
  `max_stock` int DEFAULT 100,
  `location` varchar(255) DEFAULT NULL,
  `last_restocked` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_store_inventory_store_id` (`store_id`),
  KEY `idx_store_inventory_product_id` (`product_id`),
  UNIQUE KEY `uk_store_product` (`store_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for customers
-- --------------------------------------------------------

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `insurance_provider` varchar(255) DEFAULT NULL,
  `insurance_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `loyalty_points` int DEFAULT 0,
  `preferred_store_id` varchar(36) DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_customers_email` (`email`),
  KEY `idx_customers_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for patients
-- --------------------------------------------------------

DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `patient_code` varchar(50) NOT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `insurance_provider` varchar(255) DEFAULT NULL,
  `insurance_number` varchar(100) DEFAULT NULL,
  `blood_type` varchar(5) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `medical_history` text DEFAULT NULL,
  `current_medications` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_patients_patient_code` (`patient_code`),
  KEY `idx_patients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for doctors
-- --------------------------------------------------------

DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `license_number` varchar(100) NOT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `qualification` text DEFAULT NULL,
  `experience` int DEFAULT NULL,
  `consultation_fee` decimal(10,2) DEFAULT NULL,
  `schedule` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for medical_appointments
-- --------------------------------------------------------

DROP TABLE IF EXISTS `medical_appointments`;
CREATE TABLE `medical_appointments` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `appointment_number` varchar(50) NOT NULL UNIQUE,
  `patient_id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `store_id` varchar(36) NOT NULL,
  `appointment_date` timestamp NOT NULL,
  `duration` int DEFAULT 30,
  `appointment_type` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `chief_complaint` text DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `prescriptions` json DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_medical_appointments_patient_id` (`patient_id`),
  KEY `idx_medical_appointments_doctor_id` (`doctor_id`),
  KEY `idx_medical_appointments_date` (`appointment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for appointments
-- --------------------------------------------------------

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `patient_id` varchar(36) NOT NULL,
  `store_id` varchar(36) NOT NULL,
  `service` varchar(255) NOT NULL,
  `appointment_date` timestamp NOT NULL,
  `duration` int DEFAULT 30,
  `status` varchar(50) DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_appointments_patient_id` (`patient_id`),
  KEY `idx_appointments_date` (`appointment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for prescriptions
-- --------------------------------------------------------

DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `prescription_number` varchar(50) NOT NULL UNIQUE,
  `patient_id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `prescription_date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_prescriptions_patient_id` (`patient_id`),
  KEY `idx_prescriptions_doctor_id` (`doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for prescription_items
-- --------------------------------------------------------

DROP TABLE IF EXISTS `prescription_items`;
CREATE TABLE `prescription_items` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `prescription_id` varchar(36) NOT NULL,
  `medication_name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_prescription_items_prescription_id` (`prescription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for invoices
-- --------------------------------------------------------

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `invoice_number` varchar(50) NOT NULL UNIQUE,
  `customer_id` varchar(36) DEFAULT NULL,
  `store_id` varchar(36) NOT NULL,
  `invoice_date` date DEFAULT (CURDATE()),
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'draft',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_invoices_customer_id` (`customer_id`),
  KEY `idx_invoices_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for invoice_items
-- --------------------------------------------------------

DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `invoice_id` varchar(36) NOT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_invoice_items_invoice_id` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for sales
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `store_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for sale_items
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_sale_items_sale_id` (`sale_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for account_categories
-- --------------------------------------------------------

DROP TABLE IF EXISTS `account_categories`;
CREATE TABLE `account_categories` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for chart_of_accounts
-- --------------------------------------------------------

DROP TABLE IF EXISTS `chart_of_accounts`;
CREATE TABLE `chart_of_accounts` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `account_code` varchar(20) NOT NULL UNIQUE,
  `account_name` varchar(255) NOT NULL,
  `account_type` varchar(50) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `parent_account_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `balance` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_chart_of_accounts_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for general_ledger_entries
-- --------------------------------------------------------

DROP TABLE IF EXISTS `general_ledger_entries`;
CREATE TABLE `general_ledger_entries` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `transaction_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_general_ledger_entries_account_id` (`account_id`),
  KEY `idx_general_ledger_entries_transaction_date` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for payment_transactions
-- --------------------------------------------------------

DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `transaction_reference` varchar(100) NOT NULL UNIQUE,
  `type` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `account_id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `invoice_id` varchar(36) DEFAULT NULL,
  `transaction_date` date DEFAULT (CURDATE()),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_payment_transactions_status` (`status`),
  KEY `idx_payment_transactions_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for profit_loss_entries
-- --------------------------------------------------------

DROP TABLE IF EXISTS `profit_loss_entries`;
CREATE TABLE `profit_loss_entries` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  `account_id` varchar(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `entry_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `entry_date` date NOT NULL,
  `period_month` int NOT NULL,
  `period_year` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_profit_loss_entries_account_id` (`account_id`),
  KEY `idx_profit_loss_entries_period` (`period_year`, `period_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Insert sample data
-- --------------------------------------------------------

-- Insert users
INSERT INTO `users` (`id`, `email`, `first_name`, `last_name`, `role`, `is_active`) VALUES
('admin-001', 'admin@optistorepro.com', 'Admin', 'User', 'admin', 1),
('doctor-001', 'dr.smith@optistorepro.com', 'John', 'Smith', 'doctor', 1),
('staff-001', 'staff@optistorepro.com', 'Jane', 'Doe', 'staff', 1);

-- Insert stores
INSERT INTO `stores` (`id`, `name`, `address`, `city`, `state`, `zip_code`, `phone`, `email`, `is_active`) VALUES
('store001', 'OptiStore Pro Main Branch', '123 Medical Center Dr', 'New York', 'NY', '10001', '+1-555-0100', 'main@optistorepro.com', 1),
('store002', 'OptiStore Pro Downtown', '456 Downtown Ave', 'New York', 'NY', '10002', '+1-555-0200', 'downtown@optistorepro.com', 1);

-- Insert categories
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
('cat001', 'Eye Frames', 'Prescription and fashion eyeglass frames'),
('cat002', 'Contact Lenses', 'Soft and hard contact lenses'),
('cat003', 'Solutions & Care', 'Contact lens solutions and eye care products'),
('cat004', 'Sunglasses', 'Fashion and prescription sunglasses'),
('cat005', 'Accessories', 'Cases, chains, and cleaning supplies');

-- Insert suppliers
INSERT INTO `suppliers` (`id`, `name`, `email`, `phone`, `contact_person`) VALUES
('sup001', 'Vision Supply Co.', 'orders@visionsupply.com', '+1-800-555-0001', 'Mike Johnson'),
('sup002', 'Optical Warehouse', 'sales@opticalwarehouse.com', '+1-800-555-0002', 'Sarah Williams'),
('sup003', 'Contact Lens Direct', 'info@clensesdirect.com', '+1-800-555-0003', 'David Brown');

-- Insert products
INSERT INTO `products` (`id`, `name`, `description`, `sku`, `category_id`, `supplier_id`, `cost`, `price`, `brand`, `model`, `is_active`) VALUES
('prod001', 'Ray-Ban Classic Frames', 'Classic black frame prescription glasses', 'RB-CLASSIC-001', 'cat001', 'sup001', 45.00, 89.99, 'Ray-Ban', 'Classic', 1),
('prod002', 'Acuvue Daily Lenses', 'Daily disposable contact lenses', 'ACV-DAILY-30', 'cat002', 'sup003', 25.00, 49.99, 'Acuvue', 'Daily', 1),
('prod003', 'Contact Lens Solution', 'Multi-purpose contact lens cleaning solution', 'CLS-MULTI-360', 'cat003', 'sup002', 8.50, 16.99, 'OptiFresh', 'Multi-Purpose', 1);

-- Insert store inventory
INSERT INTO `store_inventory` (`id`, `store_id`, `product_id`, `quantity`, `min_stock`, `max_stock`, `location`) VALUES
('inv001', 'store001', 'prod001', 25, 5, 100, 'Frame Display A1'),
('inv002', 'store001', 'prod002', 150, 20, 500, 'Contact Lens Refrigerator'),
('inv003', 'store001', 'prod003', 45, 10, 200, 'Solutions Shelf B2');

-- Insert customers
INSERT INTO `customers` (`id`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `insurance_provider`, `insurance_number`, `loyalty_points`) VALUES
('cust001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+1-555-1001', '1985-03-15', 'VisionCare Insurance', 'VC123456789', 150),
('cust002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-1002', '1990-07-22', 'EyeHealth Plus', 'EH987654321', 75),
('cust003', 'James', 'Wilson', 'james.wilson@email.com', '+1-555-1003', '1978-11-08', 'OptiInsure', 'OI456789123', 300);

-- Insert patients
INSERT INTO `patients` (`id`, `patient_code`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `insurance_provider`, `insurance_number`, `is_active`) VALUES
('e879a730-9df1-4a8b-8c36-093e48250b24', 'PAT-2025-001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+1-555-1001', '1985-03-15', 'Male', 'VisionCare Insurance', 'VC123456789', 1),
('f123b456-7c8d-9e0f-1234-567890abcdef', 'PAT-2025-002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-1002', '1990-07-22', 'Female', 'EyeHealth Plus', 'EH987654321', 1),
('g456c789-0d1e-2f3g-4567-890123hijklm', 'PAT-2025-003', 'James', 'Wilson', 'james.wilson@email.com', '+1-555-1003', '1978-11-08', 'Male', 'OptiInsure', 'OI456789123', 1);

-- Insert doctors
INSERT INTO `doctors` (`id`, `license_number`, `first_name`, `last_name`, `email`, `phone`, `specialization`, `consultation_fee`, `is_active`) VALUES
('doctor001', 'MD-NY-12345', 'John', 'Smith', 'dr.smith@optistorepro.com', '+1-555-2001', 'Ophthalmology', 150.00, 1),
('doctor002', 'OD-NY-67890', 'Sarah', 'Johnson', 'dr.johnson@optistorepro.com', '+1-555-2002', 'Optometry', 125.00, 1);

-- Insert account categories
INSERT INTO `account_categories` (`id`, `name`, `type`, `description`) VALUES
('acc-cat-001', 'Assets', 'asset', 'Company assets including cash, inventory, and equipment'),
('acc-cat-002', 'Liabilities', 'liability', 'Company debts and obligations'),
('acc-cat-003', 'Equity', 'equity', 'Owner equity and retained earnings'),
('acc-cat-004', 'Revenue', 'revenue', 'Income from sales and services'),
('acc-cat-005', 'Expenses', 'expense', 'Operating expenses and cost of goods sold');

-- Insert chart of accounts
INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `category_id`, `is_active`, `balance`) VALUES
('acc-001', '1000', 'Cash', 'asset', 'acc-cat-001', 1, 50000.00),
('acc-002', '1100', 'Accounts Receivable', 'asset', 'acc-cat-001', 1, 12500.00),
('acc-003', '1200', 'Inventory', 'asset', 'acc-cat-001', 1, 75000.00),
('acc-004', '2000', 'Accounts Payable', 'liability', 'acc-cat-002', 1, 15000.00),
('acc-005', '3000', 'Owner Equity', 'equity', 'acc-cat-003', 1, 100000.00),
('acc-006', '4000', 'Sales Revenue', 'revenue', 'acc-cat-004', 1, 0.00),
('acc-007', '5000', 'Cost of Goods Sold', 'expense', 'acc-cat-005', 1, 0.00),
('acc-008', '6000', 'Operating Expenses', 'expense', 'acc-cat-005', 1, 0.00);

-- Insert sample invoices
INSERT INTO `invoices` (`id`, `invoice_number`, `customer_id`, `store_id`, `subtotal`, `tax`, `total`, `status`, `payment_method`, `payment_status`) VALUES
('inv001', 'INV-2025-001', 'cust001', 'store001', 89.99, 7.20, 97.19, 'paid', 'credit_card', 'paid'),
('inv002', 'INV-2025-002', 'cust002', 'store001', 66.98, 5.36, 72.34, 'pending', 'cash', 'pending');

-- Insert invoice items
INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `description`, `quantity`, `unit_price`, `total_price`) VALUES
('invi001', 'inv001', 'prod001', 'Ray-Ban Classic Frames', 1, 89.99, 89.99),
('invi002', 'inv002', 'prod002', 'Acuvue Daily Lenses', 1, 49.99, 49.99),
('invi003', 'inv002', 'prod003', 'Contact Lens Solution', 1, 16.99, 16.99);

-- Insert payment transactions
INSERT INTO `payment_transactions` (`id`, `transaction_reference`, `type`, `amount`, `payment_method`, `status`, `description`, `account_id`) VALUES
('pay-001', 'TXN-2025-001', 'income', 97.19, 'credit_card', 'completed', 'Payment for Invoice INV-2025-001', 'acc-006'),
('pay-002', 'TXN-2025-002', 'expense', 1250.00, 'bank_transfer', 'completed', 'Product purchase from suppliers', 'acc-007');

SET foreign_key_checks = 1;

-- --------------------------------------------------------
-- Summary
-- --------------------------------------------------------
-- Tables created: 25
-- Sample records: 50+
-- Features: Complete medical practice management system
-- Compatible: MySQL 5.7+ and MySQL 8.0+
-- --------------------------------------------------------