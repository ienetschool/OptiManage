-- MySQL Data Export for OptiStore Pro
-- Generated from PostgreSQL backup: database_backup_complete.sql
-- Date: 2025-08-01T15:04:48.039Z

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- OptiStore Pro Database Backup
-- Generated on: 2025-07-31 17:10:00
-- Tables: 29 total tables
-- Total Users: 1
-- Total Stores: 1  
-- Total Products: 2
-- Total Customers: 4

-- =====================================================
-- SCHEMA CREATION
-- =====================================================

-- Create database schema structure (if needed)
-- This backup contains the data for an existing schema

-- =====================================================
-- DATA EXPORT
-- =====================================================

-- Users table
INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, is_active, last_login) VALUES
('45761289', 'zanheaa7@gmail.com', 'Xeen', 'faf', NULL, 'staff', '2025-07-30 18:08:05.887445', '2025-07-31 00:07:27.559', true, NULL);

-- Stores table
INSERT INTO stores (id, name, address, city, state, zip_code, phone, email, manager_id, is_active, created_at, updated_at, timezone, opening_hours, custom_fields) VALUES
('5ff902af-3849-4ea6-945b-4d49175d6638', 'Store1', 'Test address for store ', 'GT', 'GG', '00', '12441', 'store@exmple.com', NULL, true, '2025-07-31 01:09:37.921791', '2025-07-31 01:09:37.921791', 'America/New_York', 'rq', '{}');

-- Products table
INSERT INTO products (id, name, description, sku, category_id, supplier_id, price, cost_price, reorder_level, is_active, created_at, updated_at, custom_fields) VALUES
('00d6d248-ae81-4560-93d7-50625ac8e478', 'Test', 'Testing product', 'Aff05235', NULL, NULL, 2999.00, 25000.00, 10, true, '2025-07-30 23:26:25.803202', '2025-07-31 01:09:53.637', NULL),
('8bc389d6-c868-46c6-8f76-1ba004277605', 'RayBen', 'faf', 'RB101', '05b7e55f-ce54-4cdf-bc4f-bbf30062f531', 'eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471', 1999.00, 1500.00, 15, true, '2025-07-31 01:10:45.012833', '2025-07-31 01:10:45.012833', NULL);

-- Categories table
INSERT INTO categories (id, name, description, created_at) VALUES
('05b7e55f-ce54-4cdf-bc4f-bbf30062f531', 'Test Category ', 'Testing', '2025-07-30 23:26:53.589095');

-- Suppliers table
INSERT INTO suppliers (id, name, contact_person, email, phone, address, created_at) VALUES
('eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471', 'Test Supplier', 'Supplier 1', 'Supplier@gmail.com', '523525252', '124141', '2025-07-30 23:27:24.66404');

-- Staff table
INSERT INTO staff (id, staff_code, employee_id, first_name, last_name, email, phone, address, position, department, store_id, manager_id, hire_date, termination_date, status, role, permissions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar, date_of_birth, gender, nationality, custom_fields, created_at, updated_at) VALUES
('958400e7-db8e-4350-968a-e5c3f67c0fc6', 'STF-242960', 'AAFA', 'Test', 'staff', 'faf', 'fafa', 'faf', 'Doctor', 'Eye', '5ff902af-3849-4ea6-945b-4d49175d6638', NULL, '2025-07-30', NULL, 'active', 'staff', '', 'faf', 'faf', NULL, NULL, '1991-12-29', 'male', NULL, '{}', '2025-07-31 03:08:44.474397', '2025-07-31 03:08:44.474397'),
('d7309e8a-611f-490a-8ec7-427aea6ebf08', 'STF-676792', 'AFafa', 'fafa', 'fafa', NULL, 'afssfasf', 'fafa', 'Doctor', 'Eye', '5ff902af-3849-4ea6-945b-4d49175d6638', NULL, '2025-07-31', NULL, 'active', 'doctor', '', 'faf', 'faf', NULL, NULL, '1988-04-12', 'male', NULL, '{}', '2025-07-31 13:33:15.556787', '2025-07-31 13:33:15.556787');

-- Patients table
INSERT INTO patients (id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number, is_active, loyalty_tier, loyalty_points, custom_fields, created_at, updated_at) VALUES
('f50689ad-023b-4c75-b85c-07f4aa0f75b8', 'PAT-384641', 'Test', 'Patient 1', '1988-05-12', 'male', '5235235', NULL, 'khk', NULL, NULL, 'AB+', 'rqr', 'rqr', 'rqrq', 'rqrq', true, 'bronze', 0, '{}', '2025-07-31 17:03:57.485178', '2025-07-31 17:03:57.485178');

-- Customers table
INSERT INTO customers (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, loyalty_points, notes, created_at, updated_at, loyalty_tier, custom_fields) VALUES
('824a992b-5b2e-434a-a376-41801fc3b8ae', 'Test Customer', 'Customer1', 'Customer@Customer.com', '41241', '1979-05-07', 'klkl', 'saf', 'faf', 'faf', 0, NULL, '2025-07-31 01:12:21.727634', '2025-07-31 02:53:53.885', 'Bronze', NULL),
('77bdac32-5eb1-45cb-869e-f7b8b8df93b8', 'test Patient1', 'fafa', NULL, '215', NULL, '515', '515', '515', '51', 0, '5151', '2025-07-31 03:22:30.478457', '2025-07-31 03:22:30.478457', 'Bronze', '{}'),
('f8e50809-954c-4ff6-b1c2-a014218b1b36', 'Test Patient', '2', 'qrwrqrq@gaga.com', '42141', NULL, 'tqfwf', 'rqrq', 'rqrq', 'rqr', 0, 'rqrq', '2025-07-31 13:18:50.26681', '2025-07-31 13:18:50.26681', 'Bronze', '{}'),
('66fee2b2-4483-4979-bcf8-87d899580033', 'Test', 'Patient32', 'faffqrfq@fafaf.com', '141', NULL, 'fqwf', 'ff', 'af', 'wq', 0, 'fafa', '2025-07-31 14:11:56.389327', '2025-07-31 14:11:56.389327', 'Bronze', '{}');

-- =====================================================
-- ADDITIONAL TABLES
-- =====================================================

-- Note: The following tables exist in the schema but may be empty or contain system-generated data:
-- - appointments
-- - attendance  
-- - categories
-- - communication_log
-- - custom_fields_config
-- - doctors
-- - email_templates
-- - leave_requests
-- - medical_appointments
-- - medical_interventions
-- - medical_invoice_items
-- - medical_invoices
-- - notifications
-- - patient_history
-- - patients
-- - payroll
-- - prescription_items
-- - prescriptions
-- - sale_items
-- - sales
-- - sessions
-- - staff
-- - store_inventory
-- - suppliers
-- - system_settings

-- =====================================================
-- END OF BACKUP
-- =====================================================

-- To restore this backup:
-- 1. Create a new database
-- 2. Run the schema creation scripts
-- 3. Execute this backup file: psql -d your_database < database_backup_complete.sql

-- Backup completed successfully
-- Total records exported: 12 records across 7 main tables
-- - 1 User
-- - 1 Store  
-- - 2 Products
-- - 1 Category
-- - 1 Supplier
-- - 2 Staff members
-- - 1 Patient
-- - 4 Customers

-- Summary Statistics:
-- Total Users: 1
-- Total Stores: 1
-- Total Products: 2
-- Total Categories: 1
-- Total Suppliers: 1
-- Total Staff: 2
-- Total Patients: 1
-- Total Customers: 4