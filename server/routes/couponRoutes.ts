import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

// Get all active coupons
router.get('/coupons', async (req, res) => {
  try {
    const [coupons] = await db.execute(`
      SELECT * FROM coupons 
      WHERE status = 'active' 
      AND (expiry_date IS NULL OR expiry_date >= CURDATE())
      ORDER BY created_at DESC
    `);
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Validate coupon code in real-time
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, totalAmount, customerId } = req.body;

    if (!code) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Coupon code is required' 
      });
    }

    const [result] = await db.execute(
       `SELECT * FROM coupons WHERE code = '${code}' AND status = 'active'`
     ) as any[];
    if (result.length === 0) {
      return res.json({ 
        valid: false, 
        error: 'Invalid or expired coupon code' 
      });
    }

    const coupon = result[0] as any;

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.json({ 
        valid: false, 
        error: 'Coupon usage limit exceeded' 
      });
    }

    // Check minimum amount requirement
    if (coupon.minimum_amount && totalAmount < coupon.minimum_amount) {
      return res.json({ 
        valid: false, 
        error: `Minimum order amount of $${coupon.minimum_amount} required` 
      });
    }

    // Check if customer has already used this coupon (for single-use coupons)
    if (coupon.single_use_per_customer && customerId) {
      const [usageHistory] = await db.execute(`
        SELECT COUNT(*) as usage_count FROM coupon_usage 
        WHERE coupon_id = '${coupon.id}' AND customer_id = '${customerId}'
      `) as any[];

      if (Array.isArray(usageHistory) && usageHistory[0] && (usageHistory[0] as any).usage_count > 0) {
        return res.json({ 
          valid: false, 
          error: 'You have already used this coupon' 
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (totalAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(coupon.discount_value, totalAmount);
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Failed to validate coupon' 
    });
  }
});

// Apply coupon (record usage)
router.post('/coupons/apply', async (req, res) => {
  try {
    const { couponId, customerId, invoiceId, discountAmount } = req.body;

    // Record coupon usage
    await db.execute(`
      INSERT INTO coupon_usage (id, coupon_id, customer_id, invoice_id, discount_amount, used_at)
      VALUES ('${randomUUID()}', '${couponId}', '${customerId}', '${invoiceId}', ${discountAmount}, NOW())
    `);

    // Update coupon usage count
    await db.execute(`
      UPDATE coupons 
      SET usage_count = usage_count + 1 
      WHERE id = '${couponId}'
    `);

    res.json({ success: true, message: 'Coupon applied successfully' });

  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// Create new coupon (admin only)
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      minimum_amount,
      expiry_date,
      usage_limit,
      single_use_per_customer
    } = req.body;

    const couponId = randomUUID();

    await db.execute(`
      INSERT INTO coupons (
        id, code, name, description, discount_type, discount_value,
        max_discount_amount, minimum_amount, expiry_date, usage_limit,
        single_use_per_customer, status, created_at
      ) VALUES ('${couponId}', '${code}', '${name}', '${description}', '${discount_type}', ${discount_value}, ${max_discount_amount}, ${minimum_amount}, '${expiry_date}', ${usage_limit}, ${single_use_per_customer}, 'active', NOW())
    `);

    res.status(201).json({ 
      success: true, 
      message: 'Coupon created successfully',
      couponId 
    });

  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Update coupon status
router.patch('/coupons/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(`
      UPDATE coupons 
      SET status = '${status}', updated_at = NOW() 
      WHERE id = '${id}'
    `);

    res.json({ success: true, message: 'Coupon status updated successfully' });

  } catch (error) {
    console.error('Error updating coupon status:', error);
    res.status(500).json({ error: 'Failed to update coupon status' });
  }
});

export function registerCouponRoutes(app: any) {
  app.use('/api', router);
}