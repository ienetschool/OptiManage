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

      // For now, calculate P&L from payment data including expenditures
      const payments = await storage.getPayments();
      const filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        return paymentDate >= start && paymentDate <= end;
      });

      // Categorize transactions based on source and type for proper accounting
      const revenuePayments = filteredPayments.filter(payment => {
        // Income: regular sales, quick sales, paid appointments, medical invoices
        const isIncomeSource = ['regular_invoice', 'quick_sale', 'medical_invoice', 'appointment'].includes(payment.source);
        const isCompleted = payment.status === 'completed';
        const notExpenditure = payment.type !== 'expenditure' && payment.source !== 'expenditure';
        return isIncomeSource && isCompleted && notExpenditure;
      });

      const expenditurePayments = filteredPayments.filter(payment => {
        // Expenditures: inventory purchases, reorders, and any expenditure type
        const isExpenditureSource = payment.source === 'expenditure' || payment.source === 'reorder';
        const isExpenditureType = payment.type === 'expenditure';
        return isExpenditureSource || isExpenditureType;
      });

      // Calculate revenue (excluding expenditures)
      const revenue = revenuePayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      // Calculate actual expenses from expenditures
      const expenses = expenditurePayments.reduce((sum, expenditure) => sum + parseFloat(expenditure.amount), 0);
      const cogs = expenses * 0.7; // Assume 70% of expenditures are COGS
      
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
        entries: [
          ...revenuePayments.map(payment => ({
            date: payment.paymentDate,
            description: `Payment from ${payment.customerName}`,
            amount: parseFloat(payment.amount),
            type: 'revenue',
            source: payment.source
          })),
          ...expenditurePayments.map(expenditure => ({
            date: expenditure.paymentDate,
            description: expenditure.notes || `Expenditure - ${expenditure.customerName}`,
            amount: -parseFloat(expenditure.amount), // Negative for expenses
            type: 'expense',
            source: expenditure.source,
            category: expenditure.category
          }))
        ]
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
      
      // Separate revenue and expenditures for analytics
      const revenuePayments = payments.filter(p => p.status === 'completed' && p.type !== 'expenditure');
      const expenditurePayments = payments.filter(p => p.type === 'expenditure');
      
      const totalRevenue = revenuePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalExpenses = expenditurePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const productSales = revenuePayments.filter(p => p.source === 'regular_invoice' || p.source === 'quick_sale').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const serviceSales = revenuePayments.filter(p => p.source === 'medical_invoice' || p.source === 'appointment').reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
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

      // Expenditure breakdown by category
      const expenditureByCategory = expenditurePayments.reduce((acc, exp) => {
        const category = exp.category || 'other';
        acc[category] = (acc[category] || 0) + parseFloat(exp.amount);
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        productSales,
        serviceSales,
        paymentMethodBreakdown,
        expenditureByCategory,
        monthlyTrends,
        completionRate: payments.length > 0 ? (revenuePayments.length / payments.length) * 100 : 0,
        averageTransaction: revenuePayments.length > 0 ? totalRevenue / revenuePayments.length : 0,
        averageExpenditure: expenditurePayments.length > 0 ? totalExpenses / expenditurePayments.length : 0
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