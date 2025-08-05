import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../oauthAuth";

export function setupAccountingRoutes(app: any) {
  // Get profit & loss report
  app.get("/api/accounting/profit-loss", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, storeId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      // For now, calculate P&L from payment data
      const payments = await storage.getPayments();
      const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return paymentDate >= start && paymentDate <= end && payment.status === 'completed';
      });

      // Calculate revenue
      const revenue = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      // Calculate expenses (mock data for demonstration)
      const expenses = revenue * 0.3; // Assume 30% operating expenses
      const cogs = revenue * 0.4; // Assume 40% cost of goods sold
      
      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - expenses;

      const report = {
        period: { startDate, endDate },
        revenue,
        cogs,
        grossProfit,
        expenses,
        netProfit,
        grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
        netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
        entries: filteredPayments.map(payment => ({
          date: payment.paymentDate,
          description: `Payment from ${payment.customerName}`,
          amount: parseFloat(payment.amount),
          type: 'revenue',
          source: payment.source
        }))
      };

      res.json(report);
    } catch (error) {
      console.error("Error generating profit/loss report:", error);
      res.status(500).json({ message: "Failed to generate profit/loss report" });
    }
  });

  // Get payment analytics
  app.get("/api/accounting/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const payments = await storage.getPayments();
      
      const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const productSales = payments.filter(p => p.source === 'regular_invoice' || p.source === 'quick_sale').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const serviceSales = payments.filter(p => p.source === 'medical_invoice' || p.source === 'appointment').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Payment method breakdown
      const paymentMethodBreakdown = payments.reduce((acc, payment) => {
        const method = payment.paymentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + parseFloat(payment.amount);
        return acc;
      }, {} as Record<string, number>);

      // Monthly trends (last 12 months)
      const monthlyTrends = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthPayments = payments.filter(p => {
          const paymentDate = new Date(p.paymentDate);
          return paymentDate >= monthStart && paymentDate <= monthEnd && p.status === 'completed';
        });
        
        monthlyTrends.push({
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
          transactions: monthPayments.length
        });
      }

      res.json({
        totalRevenue,
        productSales,
        serviceSales,
        paymentMethodBreakdown,
        monthlyTrends,
        completionRate: payments.length > 0 ? (payments.filter(p => p.status === 'completed').length / payments.length) * 100 : 0,
        averageTransaction: payments.length > 0 ? totalRevenue / payments.length : 0
      });
    } catch (error) {
      console.error("Error generating analytics:", error);
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // Create payment transaction with accounting entries
  app.post("/api/accounting/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const transactionData = {
        ...req.body,
        createdBy: req.user?.id || 'system'
      };

      const transaction = await storage.createPaymentTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating payment transaction:", error);
      res.status(500).json({ message: "Failed to create payment transaction" });
    }
  });

  // Get accounting entries
  app.get("/api/accounting/entries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { accountId, startDate, endDate } = req.query;
      
      const entries = await storage.getAccountingEntries(
        accountId as string,
        startDate as string,
        endDate as string
      );
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching accounting entries:", error);
      res.status(500).json({ message: "Failed to fetch accounting entries" });
    }
  });

  // Initialize chart of accounts
  app.post("/api/accounting/initialize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.initializeChartOfAccounts();
      res.json({ message: "Chart of accounts initialized successfully" });
    } catch (error) {
      console.error("Error initializing chart of accounts:", error);
      res.status(500).json({ message: "Failed to initialize chart of accounts" });
    }
  });
}