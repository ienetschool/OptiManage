import type { Express } from "express";
import { isAuthenticated } from "../simpleAuth";
import { storage } from "../storage";

export function registerInventoryRoutes(app: Express) {
  // Reorder Stock - Create Purchase Order
  app.post("/api/products/reorder", isAuthenticated, async (req, res) => {
    try {
      const { productId, supplierId, quantity, unitCost, notes } = req.body;

      // Validate required fields
      if (!productId || !supplierId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          message: "Product ID, supplier ID, and valid quantity are required" 
        });
      }

      // Get product and supplier details
      const product = await storage.getProduct(productId);
      const supplier = await storage.getSupplier(supplierId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Calculate totals
      const cost = parseFloat(unitCost?.toString() || product.costPrice || "0");
      const subtotal = quantity * cost;
      const taxRate = 8.5; // Could be configurable
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // Create invoice for the purchase order
      const invoiceData = {
        invoiceNumber: `PO-${Date.now().toString().slice(-6)}`,
        customerId: supplierId, // Using supplier as "customer" for purchase order
        customerName: supplier.name,
        customerEmail: supplier.email || "",
        customerPhone: supplier.phone || "",
        customerAddress: supplier.address || "",
        items: [{
          id: productId,
          name: product.name,
          description: `Reorder - ${product.description || ''}`,
          quantity: quantity,
          price: cost,
          total: quantity * cost
        }],
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        notes: notes || `Purchase order for ${product.name} restocking`,
        type: 'purchase_order'
      };

      // Create the invoice
      const invoice = await storage.insertInvoice(invoiceData);

      // Update product cost price if provided
      if (unitCost && parseFloat(unitCost.toString()) !== parseFloat(product.costPrice || "0")) {
        await storage.updateProduct(productId, {
          costPrice: cost.toString()
        });
      }

      res.json({
        success: true,
        message: `Purchase order created successfully for ${quantity} units of ${product.name}`,
        invoice: invoice,
        purchaseOrder: {
          id: invoice.id,
          productId,
          productName: product.name,
          supplierId,
          supplierName: supplier.name,
          quantity,
          unitCost: cost,
          total,
          status: 'pending',
          notes
        }
      });
    } catch (error) {
      console.error("Error creating reorder:", error);
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  // Bulk Reorder - Create Bulk Purchase Order
  app.post("/api/products/bulk-reorder", isAuthenticated, async (req, res) => {
    try {
      const { supplierId, products, notes } = req.body;

      // Validate required fields
      if (!supplierId || !products || Object.keys(products).length === 0) {
        return res.status(400).json({ 
          message: "Supplier ID and products are required" 
        });
      }

      // Get supplier details
      const supplier = await storage.getSupplier(supplierId);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      // Get all products data
      const productIds = Object.keys(products);
      const productDetails = await Promise.all(
        productIds.map(id => storage.getProduct(id))
      );

      // Validate all products exist
      const validProducts = productDetails.filter(p => p !== null);
      if (validProducts.length !== productIds.length) {
        return res.status(404).json({ message: "One or more products not found" });
      }

      // Calculate items and totals
      let subtotal = 0;
      const items = validProducts.map(product => {
        const productReorder = products[product.id];
        const quantity = productReorder?.quantity || 0;
        const unitCost = productReorder?.unitCost || parseFloat(product.costPrice || "0");
        const itemTotal = quantity * unitCost;
        
        subtotal += itemTotal;
        
        return {
          id: product.id,
          name: product.name,
          description: `Bulk reorder - ${product.description || ''}`,
          quantity: quantity,
          price: unitCost,
          total: itemTotal
        };
      });

      const taxRate = 8.5;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // Create bulk purchase order invoice
      const invoiceData = {
        invoiceNumber: `BPO-${Date.now().toString().slice(-6)}`,
        customerId: supplierId,
        customerName: supplier.name,
        customerEmail: supplier.email || "",
        customerPhone: supplier.phone || "",
        customerAddress: supplier.address || "",
        items: items,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: notes || `Bulk purchase order for ${items.length} products`,
        type: 'bulk_purchase_order'
      };

      // Create the invoice
      const invoice = await storage.insertInvoice(invoiceData);

      // Update product cost prices if changed
      for (const product of validProducts) {
        const productReorder = products[product.id];
        const newCost = productReorder?.unitCost;
        
        if (newCost && parseFloat(newCost.toString()) !== parseFloat(product.costPrice || "0")) {
          await storage.updateProduct(product.id, {
            costPrice: newCost.toString()
          });
        }
      }

      res.json({
        success: true,
        message: `Bulk purchase order created successfully for ${items.length} products`,
        invoice: invoice,
        bulkPurchaseOrder: {
          id: invoice.id,
          supplierId,
          supplierName: supplier.name,
          productCount: items.length,
          total,
          status: 'pending',
          notes,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            unitCost: item.price,
            total: item.total
          }))
        }
      });
    } catch (error) {
      console.error("Error creating bulk reorder:", error);
      res.status(500).json({ message: "Failed to create bulk purchase order" });
    }
  });

  // Get Purchase Orders
  app.get("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      // Get all invoices that are purchase orders
      const allInvoices = await storage.getInvoices();
      const purchaseOrders = allInvoices.filter(invoice => 
        invoice.type === 'purchase_order' || invoice.type === 'bulk_purchase_order'
      );

      res.json(purchaseOrders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  // Update Purchase Order Status
  app.patch("/api/purchase-orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Valid statuses: draft, sent, approved, received, cancelled
      const validStatuses = ['draft', 'sent', 'approved', 'received', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedInvoice = await storage.updateInvoice(id, { status });
      
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      // If status is 'received', update inventory levels
      if (status === 'received') {
        // This would typically update stock levels
        // Implementation depends on how inventory tracking is handled
        console.log(`Purchase order ${id} marked as received - inventory update needed`);
      }

      res.json({
        success: true,
        message: `Purchase order status updated to ${status}`,
        purchaseOrder: updatedInvoice
      });
    } catch (error) {
      console.error("Error updating purchase order status:", error);
      res.status(500).json({ message: "Failed to update purchase order status" });
    }
  });
}