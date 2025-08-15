import mysql from 'mysql2/promise';

export async function forceMySQLFix() {
  const connection = mysql.createConnection({
    host: '5.181.218.15',
    port: 3306,
    user: 'ledbpt_optie',
    password: 'g79h94LAP',
    database: 'opticpro'
  });

  try {
    console.log('🔧 Direct MySQL connection to fix schema...');
    await connection.connect();

    // First drop and recreate appointments table completely
    await connection.execute('DROP TABLE IF EXISTS appointments');
    await connection.execute(`
      CREATE TABLE appointments (
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

    // Drop and recreate invoice_items table completely
    await connection.execute('DROP TABLE IF EXISTS invoice_items');
    await connection.execute(`
      CREATE TABLE invoice_items (
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

    // Add missing columns to invoices table
    try {
      await connection.execute('ALTER TABLE invoices ADD COLUMN payment_date DATE');
    } catch (e) { console.log('payment_date column exists'); }

    // Insert sample data
    await connection.execute(`
      INSERT IGNORE INTO appointments (id, patient_id, appointment_date, status, service) 
      VALUES ('apt001', 'e879a730-9df1-4a8b-8c36-093e48250b24', CURDATE(), 'scheduled', 'Eye Examination')
    `);

    console.log('✅ MySQL schema fixed directly!');
    return { success: true, message: 'MySQL schema fixed with direct connection' };

  } catch (error) {
    console.error('❌ Direct MySQL fix error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await connection.end();
  }
}