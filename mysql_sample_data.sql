-- OptiStore Pro - MySQL Sample Data
-- Complete medical practice management system data

-- Enable foreign key checks
SET foreign_key_checks = 1;

-- Users table
INSERT INTO users (id, email, first_name, last_name, role, is_active) VALUES
('admin-001', 'admin@optistorepro.com', 'Admin', 'User', 'admin', 1),
('doctor-001', 'dr.smith@optistorepro.com', 'John', 'Smith', 'doctor', 1),
('staff-001', 'staff@optistorepro.com', 'Jane', 'Doe', 'staff', 1);

-- Stores
INSERT INTO stores (id, name, address, city, state, zip_code, phone, email, is_active) VALUES
('store001', 'OptiStore Pro Main Branch', '123 Medical Center Dr', 'New York', 'NY', '10001', '+1-555-0100', 'main@optistorepro.com', 1),
('store002', 'OptiStore Pro Downtown', '456 Downtown Ave', 'New York', 'NY', '10002', '+1-555-0200', 'downtown@optistorepro.com', 1);

-- Categories
INSERT INTO categories (id, name, description) VALUES
('cat001', 'Eye Frames', 'Prescription and fashion eyeglass frames'),
('cat002', 'Contact Lenses', 'Soft and hard contact lenses'),
('cat003', 'Solutions & Care', 'Contact lens solutions and eye care products'),
('cat004', 'Sunglasses', 'Fashion and prescription sunglasses'),
('cat005', 'Accessories', 'Cases, chains, and cleaning supplies');

-- Suppliers
INSERT INTO suppliers (id, name, email, phone, contact_person) VALUES
('sup001', 'Vision Supply Co.', 'orders@visionsupply.com', '+1-800-555-0001', 'Mike Johnson'),
('sup002', 'Optical Warehouse', 'sales@opticalwarehouse.com', '+1-800-555-0002', 'Sarah Williams'),
('sup003', 'Contact Lens Direct', 'info@clensesdirect.com', '+1-800-555-0003', 'David Brown');

-- Products
INSERT INTO products (id, name, description, sku, category_id, supplier_id, cost, price, brand, model, is_active) VALUES
('prod001', 'Ray-Ban Classic Frames', 'Classic black frame prescription glasses', 'RB-CLASSIC-001', 'cat001', 'sup001', 45.00, 89.99, 'Ray-Ban', 'Classic', 1),
('prod002', 'Acuvue Daily Lenses', 'Daily disposable contact lenses', 'ACV-DAILY-30', 'cat002', 'sup003', 25.00, 49.99, 'Acuvue', 'Daily', 1),
('prod003', 'Contact Lens Solution', 'Multi-purpose contact lens cleaning solution', 'CLS-MULTI-360', 'cat003', 'sup002', 8.50, 16.99, 'OptiFresh', 'Multi-Purpose', 1),
('prod004', 'Oakley Sport Sunglasses', 'UV protection sport sunglasses', 'OAK-SPORT-001', 'cat004', 'sup001', 75.00, 149.99, 'Oakley', 'Sport Pro', 1),
('prod005', 'Lens Cleaning Kit', 'Professional lens cleaning kit with cloth and spray', 'LCK-PRO-001', 'cat005', 'sup002', 12.00, 24.99, 'OptiClean', 'Pro Kit', 1);

-- Store Inventory
INSERT INTO store_inventory (id, store_id, product_id, quantity, min_stock, max_stock, location) VALUES
('inv001', 'store001', 'prod001', 25, 5, 100, 'Frame Display A1'),
('inv002', 'store001', 'prod002', 150, 20, 500, 'Contact Lens Refrigerator'),
('inv003', 'store001', 'prod003', 45, 10, 200, 'Solutions Shelf B2'),
('inv004', 'store002', 'prod001', 15, 5, 50, 'Frame Display A1'),
('inv005', 'store002', 'prod004', 30, 5, 100, 'Sunglasses Display C1');

-- Customers
INSERT INTO customers (id, first_name, last_name, email, phone, date_of_birth, insurance_provider, insurance_number, loyalty_points) VALUES
('cust001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+1-555-1001', '1985-03-15', 'VisionCare Insurance', 'VC123456789', 150),
('cust002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-1002', '1990-07-22', 'EyeHealth Plus', 'EH987654321', 75),
('cust003', 'James', 'Wilson', 'james.wilson@email.com', '+1-555-1003', '1978-11-08', 'OptiInsure', 'OI456789123', 300);

-- Patients
INSERT INTO patients (id, patient_code, first_name, last_name, email, phone, date_of_birth, gender, insurance_provider, insurance_number, is_active) VALUES
('patient001', 'PAT-2025-001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '+1-555-1001', '1985-03-15', 'Male', 'VisionCare Insurance', 'VC123456789', 1),
('patient002', 'PAT-2025-002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-1002', '1990-07-22', 'Female', 'EyeHealth Plus', 'EH987654321', 1),
('patient003', 'PAT-2025-003', 'James', 'Wilson', 'james.wilson@email.com', '+1-555-1003', '1978-11-08', 'Male', 'OptiInsure', 'OI456789123', 1);

-- Doctors
INSERT INTO doctors (id, license_number, first_name, last_name, email, phone, specialization, consultation_fee, is_active) VALUES
('doctor001', 'MD-NY-12345', 'John', 'Smith', 'dr.smith@optistorepro.com', '+1-555-2001', 'Ophthalmology', 150.00, 1),
('doctor002', 'OD-NY-67890', 'Sarah', 'Johnson', 'dr.johnson@optistorepro.com', '+1-555-2002', 'Optometry', 125.00, 1);

-- Medical Appointments
INSERT INTO medical_appointments (id, appointment_number, patient_id, doctor_id, store_id, appointment_date, appointment_type, status, fee, is_paid) VALUES
('appt001', 'APT-2025-001', 'patient001', 'doctor001', 'store001', '2025-01-20 10:00:00', 'Regular Checkup', 'scheduled', 150.00, 0),
('appt002', 'APT-2025-002', 'patient002', 'doctor002', 'store001', '2025-01-21 14:30:00', 'Contact Lens Fitting', 'scheduled', 125.00, 0);

-- Prescriptions
INSERT INTO prescriptions (id, prescription_number, patient_id, doctor_id, prescription_date, valid_until, status) VALUES
('rx001', 'RX-2025-001', 'patient001', 'doctor001', '2025-01-15', '2026-01-15', 'active'),
('rx002', 'RX-2025-002', 'patient002', 'doctor002', '2025-01-16', '2026-01-16', 'active');

-- Prescription Items
INSERT INTO prescription_items (id, prescription_id, medication_name, dosage, frequency, duration, quantity) VALUES
('rxi001', 'rx001', 'Eye Drops - Artificial Tears', '1-2 drops', '3 times daily', '30 days', 2),
('rxi002', 'rx002', 'Contact Lens Daily Disposable', '1 lens per eye', 'Daily', '30 days', 60);

-- Invoices
INSERT INTO invoices (id, invoice_number, customer_id, store_id, subtotal, tax, total, status, payment_method, payment_status) VALUES
('inv001', 'INV-2025-001', 'cust001', 'store001', 89.99, 7.20, 97.19, 'paid', 'credit_card', 'paid'),
('inv002', 'INV-2025-002', 'cust002', 'store001', 66.98, 5.36, 72.34, 'pending', 'cash', 'pending');

-- Invoice Items
INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price, total_price) VALUES
('invi001', 'inv001', 'prod001', 1, 89.99, 89.99),
('invi002', 'inv002', 'prod002', 1, 49.99, 49.99),
('invi003', 'inv002', 'prod003', 1, 16.99, 16.99);

-- Sales
INSERT INTO sales (id, store_id, customer_id, user_id, total, tax, payment_method, payment_status) VALUES
('sale001', 'store001', 'cust001', 'staff-001', 97.19, 7.20, 'credit_card', 'completed'),
('sale002', 'store001', 'cust002', 'staff-001', 72.34, 5.36, 'cash', 'pending');

-- Sale Items
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price) VALUES
('salei001', 'sale001', 'prod001', 1, 89.99, 89.99),
('salei002', 'sale002', 'prod002', 1, 49.99, 49.99),
('salei003', 'sale002', 'prod003', 1, 16.99, 16.99);

-- Account Categories
INSERT INTO account_categories (id, name, type, description) VALUES
('acc-cat-001', 'Assets', 'asset', 'Company assets including cash, inventory, and equipment'),
('acc-cat-002', 'Liabilities', 'liability', 'Company debts and obligations'),
('acc-cat-003', 'Equity', 'equity', 'Owner equity and retained earnings'),
('acc-cat-004', 'Revenue', 'revenue', 'Income from sales and services'),
('acc-cat-005', 'Expenses', 'expense', 'Operating expenses and cost of goods sold');

-- Chart of Accounts
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, category_id, parent_account_id, is_active) VALUES
('acc-001', '1000', 'Cash', 'asset', 'acc-cat-001', NULL, 1),
('acc-002', '1100', 'Accounts Receivable', 'asset', 'acc-cat-001', NULL, 1),
('acc-003', '1200', 'Inventory', 'asset', 'acc-cat-001', NULL, 1),
('acc-004', '2000', 'Accounts Payable', 'liability', 'acc-cat-002', NULL, 1),
('acc-005', '3000', 'Owner Equity', 'equity', 'acc-cat-003', NULL, 1),
('acc-006', '4000', 'Sales Revenue', 'revenue', 'acc-cat-004', NULL, 1),
('acc-007', '5000', 'Cost of Goods Sold', 'expense', 'acc-cat-005', NULL, 1),
('acc-008', '6000', 'Operating Expenses', 'expense', 'acc-cat-005', NULL, 1);

-- Payment Transactions
INSERT INTO payment_transactions (id, transaction_reference, type, amount, payment_method, status, description, account_id) VALUES
('pay-001', 'TXN-001', 'income', 97.19, 'credit_card', 'completed', 'Sale to Rajesh Kumar', 'acc-006'),
('pay-002', 'TXN-002', 'expense', 45.00, 'bank_transfer', 'completed', 'Purchase from Vision Supply Co.', 'acc-007');

COMMIT;