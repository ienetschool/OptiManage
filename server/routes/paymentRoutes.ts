import type { Express } from "express";
import { isAuthenticated } from "../oauthAuth";
import { storage } from "../storage";

export function registerPaymentRoutes(app: Express) {
  // Get payments - combines data from appointments, sales, and invoices
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const { search, status, method, dateRange } = req.query;
      
      // Fetch real data from all payment sources
      const [appointments, sales, invoices, customers] = await Promise.all([
        storage.getAppointments(),
        storage.getSales(),
        storage.getInvoices(),
        storage.getCustomers()
      ]);

      // Create customer lookup map
      const customerMap = new Map(customers.map(c => [c.id, c]));

      // Combine all payment sources into unified payment records
      const payments: any[] = [];

      // Add appointment payments
      appointments.forEach(appointment => {
        const customer = customerMap.get(appointment.customerId || '') || customerMap.get(appointment.patientId || '');
        if (appointment.appointmentFee && parseFloat(appointment.appointmentFee.toString()) > 0) {
          payments.push({
            id: `apt-${appointment.id}`,
            invoiceId: `APT-${appointment.id.slice(-6)}`,
            customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : appointment.patientId || 'Unknown Patient',
            amount: parseFloat(appointment.appointmentFee.toString()),
            paymentMethod: appointment.paymentMethod || 'cash',
            status: appointment.paymentStatus || 'pending',
            transactionId: `apt_${appointment.id}`,
            paymentDate: appointment.paymentDate || appointment.appointmentDate,
            createdAt: appointment.createdAt || appointment.appointmentDate,
            type: 'appointment',
            sourceId: appointment.id
          });
        }
      });

      // Add sales payments
      sales.forEach(sale => {
        const customer = customerMap.get(sale.customerId || '');
        payments.push({
          id: `sale-${sale.id}`,
          invoiceId: `SALE-${sale.id.slice(-6)}`,
          customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Walk-in Customer',
          amount: parseFloat(sale.total.toString()),
          paymentMethod: sale.paymentMethod,
          status: sale.paymentStatus || 'completed',
          transactionId: `sale_${sale.id}`,
          paymentDate: sale.createdAt,
          createdAt: sale.createdAt,
          type: 'sale',
          sourceId: sale.id
        });
      });

      // Add invoice payments (when they have payment records)
      invoices.forEach(invoice => {
        const customer = customerMap.get(invoice.customerId);
        if (invoice.status === 'paid' || invoice.total > 0) {
          payments.push({
            id: `inv-${invoice.id}`,
            invoiceId: invoice.invoiceNumber || `INV-${invoice.id.slice(-6)}`,
            customerName: customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Unknown Customer',
            amount: parseFloat(invoice.total.toString()),
            paymentMethod: 'card', // Default for invoices
            status: invoice.status === 'paid' ? 'completed' : 'pending',
            transactionId: `inv_${invoice.id}`,
            paymentDate: invoice.date,
            createdAt: invoice.date,
            type: 'invoice',
            sourceId: invoice.id
          });
        }
      });

      // Sort by payment date (newest first)
      payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      let filteredPayments = payments;

      // Apply search filter
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredPayments = filteredPayments.filter(payment =>
          payment.customerName.toLowerCase().includes(searchTerm) ||
          payment.invoiceId.toLowerCase().includes(searchTerm) ||
          payment.transactionId?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply status filter
      if (status && status !== "all") {
        filteredPayments = filteredPayments.filter(payment => payment.status === status);
      }

      // Apply payment method filter
      if (method && method !== "all") {
        filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === method);
      }

      // Apply date range filter
      if (dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case "7d":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30d":
            startDate.setDate(now.getDate() - 30);
            break;
          case "90d":
            startDate.setDate(now.getDate() - 90);
            break;
          case "1y":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }
        
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= startDate;
        });
      }

      console.log(`Found ${payments.length} total payments, returning ${filteredPayments.length} after filters`);
      res.json(filteredPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Create payment
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const paymentData = req.body;
      
      // Mock create - replace with actual payment processing
      const newPayment = {
        id: Date.now().toString(),
        ...paymentData,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: "completed"
      };

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Update payment
  app.put("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      
      // Mock update - replace with actual payment processing
      const updatedPayment = {
        id,
        ...paymentData,
        updatedAt: new Date().toISOString()
      };

      res.json(updatedPayment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Process payment endpoint for "Pay Now" functionality
  app.post("/api/payments/:id/process", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required" });
      }

      // Extract payment type and source ID from payment ID
      // Payment ID format: apt-dcd6e7f3-a070-4959-8273-f0b6bef103c3
      // We need to extract the UUID part after 'apt-'
      const parts = id.split('-');
      const type = parts[0]; // 'apt'
      const sourceId = parts.slice(1).join('-'); // 'dcd6e7f3-a070-4959-8273-f0b6bef103c3'
      
      console.log(`Processing payment: ${id}, type: ${type}, sourceId: ${sourceId}`);
      
      if (type === 'apt') {
        // Update appointment payment status
        const appointment = await storage.getAppointment(sourceId);
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        // Update appointment with payment information
        await storage.updateAppointment(sourceId, {
          paymentStatus: 'paid',
          paymentMethod: paymentMethod,
          paymentDate: new Date()
        });

        // Generate invoice for the appointment if fee exists
        if (appointment.appointmentFee) {
          const fee = parseFloat(appointment.appointmentFee.toString());
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
          
          const invoiceData = {
            invoiceNumber: `INV-APT-${Date.now()}`,
            patientId: appointment.patientId,
            appointmentId: sourceId,
            storeId: appointment.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
            invoiceDate: new Date(),
            dueDate: dueDate.toISOString().split('T')[0], // Date format for due date
            subtotal: fee.toString(),
            taxAmount: (fee * 0.08).toString(),
            discountAmount: "0",
            total: (fee * 1.08).toString(),
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            paymentDate: new Date(),
            notes: `Payment for ${appointment.service} appointment`
          };

          try {
            // Create medical invoice directly via storage
            await storage.createMedicalInvoice(invoiceData);
          } catch (invoiceError) {
            console.error("Invoice generation error:", invoiceError);
            // Don't fail the payment if invoice generation fails
          }
        }

        res.json({
          success: true,
          message: "Payment processed successfully and invoice generated",
          paymentId: id,
          invoiceNumber: `INV-APT-${Date.now()}`
        });

      } else if (type === 'inv') {
        // Update invoice payment status
        const invoice = await storage.getInvoice(sourceId);
        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }

        await storage.updateInvoice(sourceId, {
          status: 'paid',
          paymentMethod: paymentMethod,
          paymentDate: new Date()
        });

        res.json({
          success: true,
          message: "Payment processed successfully",
          paymentId: id,
          invoiceNumber: invoice.invoiceNumber
        });

      } else {
        return res.status(400).json({ message: "Invalid payment type" });
      }

    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
}