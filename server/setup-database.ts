import { db } from './db';

export async function createMissingTables() {
  try {
    // Create staff table
    await db.execute(`
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
      )
    `);

    // Create medical_invoices table
    await db.execute(`
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
      )
    `);

    // Add missing columns to invoices table
    const missingColumns = [
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS date DATE',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS applied_coupon_code VARCHAR(50)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_type VARCHAR(20)',
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS coupon_description TEXT'
    ];

    // Add missing columns to appointments table
    const appointmentColumns = [
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_id VARCHAR(36)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS staff_id VARCHAR(36)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_doctor_id VARCHAR(36)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration INT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service VARCHAR(255)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_fee DECIMAL(10,2)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_date DATE',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(50)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS priority VARCHAR(50)',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT',
      'ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_notes TEXT'
    ];

    // Add missing columns to invoices table for payment tracking
    const invoicePaymentColumns = [
      'ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_date DATE'
    ];

    // Add missing columns to invoice_items table
    const invoiceItemColumns = [
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)',
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS description TEXT',
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS quantity INT',
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2)',
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2)',
      'ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total DECIMAL(10,2)'
    ];

    for (const sql of missingColumns) {
      try {
        await db.execute(sql);
      } catch (error) {
        console.log(`Column might already exist: ${error}`);
      }
    }

    for (const sql of appointmentColumns) {
      try {
        await db.execute(sql);
      } catch (error) {
        console.log(`Column might already exist: ${error}`);
      }
    }

    for (const sql of invoicePaymentColumns) {
      try {
        await db.execute(sql);
      } catch (error) {
        console.log(`Column might already exist: ${error}`);
      }
    }

    for (const sql of invoiceItemColumns) {
      try {
        await db.execute(sql);
      } catch (error) {
        console.log(`Column might already exist: ${error}`);
      }
    }

    // Insert sample staff member
    await db.execute(`
      INSERT IGNORE INTO staff (id, staff_code, first_name, last_name, email, position, status, role) 
      VALUES ('staff001', 'STF001', 'John', 'Admin', 'admin@optistore.com', 'Manager', 'active', 'admin')
    `);

    console.log('✅ Database tables created successfully!');
    return { success: true, message: 'All database tables created successfully' };
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}