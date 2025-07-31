import type { Express } from "express";
import { isAuthenticated } from "../simpleAuth";

export function registerPaymentRoutes(app: Express) {
  // Get payments
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const { search, status, method, dateRange } = req.query;
      
      // Mock payments data
      const payments = [
        {
          id: "1",
          invoiceId: "INV-001",
          customerName: "Sarah Johnson",
          amount: 250.00,
          paymentMethod: "card",
          status: "completed",
          transactionId: "txn_1234567890",
          paymentDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          invoiceId: "INV-002",
          customerName: "Michael Chen",
          amount: 450.00,
          paymentMethod: "cash",
          status: "completed",
          paymentDate: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "3",
          invoiceId: "INV-003",
          customerName: "Emma Wilson",
          amount: 180.00,
          paymentMethod: "card",
          status: "pending",
          transactionId: "txn_0987654321",
          paymentDate: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: "4",
          invoiceId: "INV-004",
          customerName: "David Brown",
          amount: 320.00,
          paymentMethod: "check",
          status: "failed",
          paymentDate: new Date(Date.now() - 259200000).toISOString(),
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      let filteredPayments = payments;

      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredPayments = filteredPayments.filter(payment =>
          payment.customerName.toLowerCase().includes(searchTerm) ||
          payment.invoiceId.toLowerCase().includes(searchTerm) ||
          payment.transactionId?.toLowerCase().includes(searchTerm)
        );
      }

      if (status && status !== "all") {
        filteredPayments = filteredPayments.filter(payment => payment.status === status);
      }

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
        }

        filteredPayments = filteredPayments.filter(payment =>
          new Date(payment.paymentDate) >= startDate
        );
      }

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

      res.json(newPayment);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
}