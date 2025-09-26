import { db } from './db';

export async function setupCouponTables() {
  try {
    console.log('🎫 Setting up coupon system tables...');

    // Create coupons table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        max_discount_amount DECIMAL(10,2) NULL,
        minimum_amount DECIMAL(10,2) DEFAULT 0,
        expiry_date DATE NULL,
        usage_limit INT NULL,
        usage_count INT DEFAULT 0,
        single_use_per_customer BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create coupon_usage table for tracking usage history
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id VARCHAR(36) PRIMARY KEY,
        coupon_id VARCHAR(36) NOT NULL,
        customer_id VARCHAR(36),
        invoice_id VARCHAR(36),
        discount_amount DECIMAL(10,2) NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
      )
    `);

    // Insert sample coupons for testing
    const sampleCoupons = [
      {
        id: 'coupon-001',
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off for new customers',
        discount_type: 'percentage',
        discount_value: 10.00,
        max_discount_amount: 50.00,
        minimum_amount: 100.00,
        expiry_date: '2025-12-31',
        usage_limit: 1000,
        single_use_per_customer: true
      },
      {
        id: 'coupon-002',
        code: 'SAVE20',
        name: 'Fixed $20 Off',
        description: '$20 off on orders over $200',
        discount_type: 'fixed',
        discount_value: 20.00,
        max_discount_amount: null,
        minimum_amount: 200.00,
        expiry_date: '2025-06-30',
        usage_limit: 500,
        single_use_per_customer: false
      },
      {
        id: 'coupon-003',
        code: 'EYECARE15',
        name: 'Eye Care Special',
        description: '15% off on all eye care services',
        discount_type: 'percentage',
        discount_value: 15.00,
        max_discount_amount: 100.00,
        minimum_amount: 50.00,
        expiry_date: null,
        usage_limit: null,
        single_use_per_customer: false
      }
    ];

    for (const coupon of sampleCoupons) {
      await db.execute(`
        INSERT IGNORE INTO coupons (
          id, code, name, description, discount_type, discount_value,
          max_discount_amount, minimum_amount, expiry_date, usage_limit,
          single_use_per_customer, status
        ) VALUES (
          '${coupon.id}',
          '${coupon.code}',
          '${coupon.name}',
          '${coupon.description}',
          '${coupon.discount_type}',
          ${coupon.discount_value},
          ${coupon.max_discount_amount || 'NULL'},
          ${coupon.minimum_amount},
          ${coupon.expiry_date ? `'${coupon.expiry_date}'` : 'NULL'},
          ${coupon.usage_limit || 'NULL'},
          ${coupon.single_use_per_customer},
          'active'
        )
      `);
    }

    console.log('✅ Coupon system tables created successfully');
    console.log('✅ Sample coupons inserted');
    console.log('📋 Available test coupons:');
    console.log('   - WELCOME10: 10% off (max $50) for new customers');
    console.log('   - SAVE20: $20 off on orders over $200');
    console.log('   - EYECARE15: 15% off on eye care services');

  } catch (error) {
    console.error('❌ Error setting up coupon tables:', error);
    throw error;
  }
}