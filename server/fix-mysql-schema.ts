import { db } from './db';

export async function fixMySQLSchema() {
  try {
    console.log('🔧 Starting comprehensive MySQL schema fix...');

    // First, check what tables exist
    const tables = await db.execute("SHOW TABLES");
    console.log('📊 Existing tables:', tables);

    // Check appointments table structure
    try {
      const appointmentsStructure = await db.execute("DESCRIBE appointments");
      console.log('📋 Appointments table structure:', appointmentsStructure);
    } catch (error) {
      console.log('❌ Appointments table may not exist:', error);
    }

    // Create appointments table with all required columns if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36),
        customer_id VARCHAR(36),
        store_id VARCHAR(36),
        staff_id VARCHAR(36),
        assigned_doctor_id VARCHAR(36),
        appointment_date DATE,
        duration INT,
        service VARCHAR(255),
        appointment_fee DECIMAL(10,2),
        payment_status VARCHAR(50),
        payment_method VARCHAR(50),
        payment_date DATE,
        status VARCHAR(50),
        priority VARCHAR(50),
        notes TEXT,
        doctor_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create invoice_items table with all required columns if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id VARCHAR(36) PRIMARY KEY,
        invoice_id VARCHAR(36),
        product_id VARCHAR(36),
        product_name VARCHAR(255),
        description TEXT,
        quantity INT,
        unit_price DECIMAL(10,2),
        discount DECIMAL(10,2),
        total DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Now force add missing columns with explicit ALTER TABLE statements
    const alterStatements = [
      // Appointments table columns
      "ALTER TABLE appointments ADD COLUMN customer_id VARCHAR(36)",
      "ALTER TABLE appointments ADD COLUMN staff_id VARCHAR(36)", 
      "ALTER TABLE appointments ADD COLUMN assigned_doctor_id VARCHAR(36)",
      "ALTER TABLE appointments ADD COLUMN appointment_date DATE",
      "ALTER TABLE appointments ADD COLUMN duration INT",
      "ALTER TABLE appointments ADD COLUMN service VARCHAR(255)",
      "ALTER TABLE appointments ADD COLUMN appointment_fee DECIMAL(10,2)",
      "ALTER TABLE appointments ADD COLUMN payment_status VARCHAR(50)",
      "ALTER TABLE appointments ADD COLUMN payment_method VARCHAR(50)",
      "ALTER TABLE appointments ADD COLUMN payment_date DATE",
      "ALTER TABLE appointments ADD COLUMN status VARCHAR(50)",
      "ALTER TABLE appointments ADD COLUMN priority VARCHAR(50)",
      "ALTER TABLE appointments ADD COLUMN notes TEXT",
      "ALTER TABLE appointments ADD COLUMN doctor_notes TEXT",
      
      // Invoice items table columns
      "ALTER TABLE invoice_items ADD COLUMN product_name VARCHAR(255)",
      "ALTER TABLE invoice_items ADD COLUMN description TEXT",
      "ALTER TABLE invoice_items ADD COLUMN quantity INT",
      "ALTER TABLE invoice_items ADD COLUMN unit_price DECIMAL(10,2)",
      "ALTER TABLE invoice_items ADD COLUMN discount DECIMAL(10,2)",
      "ALTER TABLE invoice_items ADD COLUMN total DECIMAL(10,2)",
      
      // Invoices table columns
      "ALTER TABLE invoices ADD COLUMN payment_date DATE"
    ];

    for (const sql of alterStatements) {
      try {
        await db.execute(sql);
        console.log(`✅ Added column: ${sql}`);
      } catch (error) {
        // Column might already exist, which is fine
        console.log(`⚠️ Column exists or error: ${sql} - ${error instanceof Error ? error.message : error}`);
      }
    }

    console.log('✅ MySQL schema fix complete!');
    return { success: true, message: 'MySQL schema fixed successfully' };

  } catch (error) {
    console.error('❌ MySQL schema fix error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}