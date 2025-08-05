import type { Express } from "express";
import { isAuthenticated } from "../oauthAuth";
import { storage } from "../storage";

export function registerAccountingRoutes(app: Express) {
  // Get profit & loss report
  app.get("/api/accounting/profit-loss", isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, storeId } = req.query;
      
      // Default to last 30 days if no dates provided
      const start = startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate as string || new Date().toISOString().split('T')[0];
      
      console.log(`📊 PROFIT & LOSS REPORT: ${start} to ${end}`);
      
      // Get all payments for the period
      const allPayments = await storage.getPayments();
      
      // Filter payments by date range
      const filteredPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        return paymentDate >= startDateObj && paymentDate <= endDateObj;
      });
      
      // Categorize payments into income and expenditures
      const incomePayments = filteredPayments.filter(payment => {
        // Income sources: regular invoices, medical invoices, appointments, sales
        return payment.source === 'regular_invoice' || 
               payment.source === 'medical_invoice' || 
               payment.source === 'appointment' ||
               payment.source === 'quick_sale' ||
               payment.type === 'income' ||
               (!payment.source && !payment.type); // Default to income for legacy records
      });
      
      const expenditurePayments = filteredPayments.filter(payment => {
        // Expenditure sources: product purchases, reorders, supplier payments
        const notes = (payment.notes || '').toLowerCase();
        const source = (payment.source || '').toLowerCase();
        
        // Check for inventory-related keywords in notes and source
        const isInventoryExpenditure = source.includes('reorder') ||
                                     notes.includes('reorder') ||
                                     notes.includes('reorder stock') ||
                                     notes.includes('reorder product') ||
                                     notes.includes('bulk reorder') ||
                                     notes.includes('expenditure') ||
                                     notes.includes('purchase') ||
                                     notes.includes('restock') ||
                                     notes.includes('supplier') ||
                                     notes.includes('inventory purchase');
        
        return payment.source === 'expenditure' || 
               payment.type === 'expenditure' ||
               payment.source === 'product_purchase' ||
               payment.source === 'reorder' ||
               isInventoryExpenditure;
      });
      
      // Calculate totals
      const totalIncome = incomePayments.reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0);
      const totalExpenditures = expenditurePayments.reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0);
      const netProfit = totalIncome - totalExpenditures;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
      
      // Group by categories for detailed breakdown
      const incomeByCategory = {
        product_sales: incomePayments.filter(p => p.source === 'regular_invoice' || p.source === 'quick_sale').reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        medical_services: incomePayments.filter(p => p.source === 'medical_invoice').reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        appointments: incomePayments.filter(p => p.source === 'appointment').reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        other: incomePayments.filter(p => !p.source || (!['regular_invoice', 'quick_sale', 'medical_invoice', 'appointment'].includes(p.source))).reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
      };
      
      const expendituresByCategory = {
        inventory_purchases: expenditurePayments.filter(p => {
          const notes = (p.notes || '').toLowerCase();
          const source = (p.source || '').toLowerCase();
          
          // Check for inventory-related keywords
          const isInventoryExpenditure = source.includes('reorder') ||
                                        notes.includes('reorder') ||
                                        notes.includes('reorder stock') ||
                                        notes.includes('reorder product') ||
                                        notes.includes('bulk reorder') ||
                                        notes.includes('expenditure') ||
                                        notes.includes('purchase') ||
                                        notes.includes('restock') ||
                                        notes.includes('supplier') ||
                                        notes.includes('inventory purchase');
          
          return p.category === 'inventory' || 
                 p.source === 'product_purchase' || 
                 p.source === 'reorder' ||
                 isInventoryExpenditure;
        }).reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        operating_expenses: expenditurePayments.filter(p => p.category === 'operating').reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
        other: expenditurePayments.filter(p => {
          const notes = (p.notes || '').toLowerCase();
          const source = (p.source || '').toLowerCase();
          
          // Check if it's NOT an inventory expenditure and NOT operating
          const isInventoryExpenditure = source.includes('reorder') ||
                                        notes.includes('reorder') ||
                                        notes.includes('reorder stock') ||
                                        notes.includes('reorder product') ||
                                        notes.includes('bulk reorder') ||
                                        notes.includes('expenditure') ||
                                        notes.includes('purchase') ||
                                        notes.includes('restock') ||
                                        notes.includes('supplier') ||
                                        notes.includes('inventory purchase');
          
          return !p.category && 
                 p.source !== 'product_purchase' && 
                 p.source !== 'reorder' &&
                 p.category !== 'inventory' &&
                 p.category !== 'operating' &&
                 !isInventoryExpenditure;
        }).reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0)
      };
      
      const report = {
        period: { startDate: start, endDate: end },
        summary: {
          totalIncome,
          totalExpenditures,
          grossProfit: totalIncome, // For service business, revenue = gross profit
          netProfit,
          profitMargin
        },
        income: {
          total: totalIncome,
          categories: incomeByCategory,
          transactions: incomePayments.length
        },
        expenditures: {
          total: totalExpenditures,
          categories: expendituresByCategory,
          transactions: expenditurePayments.length
        },
        entries: filteredPayments.map(payment => ({
          id: payment.id,
          date: payment.paymentDate,
          description: `${payment.customerName} - ${payment.invoiceId}`,
          category: payment.source || payment.type || 'income',
          type: expenditurePayments.includes(payment) ? 'expenditure' : 'income',
          amount: parseFloat(payment.amount || "0"),
          source: payment.source,
          notes: payment.notes
        }))
      };
      
      console.log(`💰 ACCOUNTING SUMMARY: Income: $${totalIncome.toFixed(2)}, Expenditures: $${totalExpenditures.toFixed(2)}, Net: $${netProfit.toFixed(2)}`);
      console.log(`📊 EXPENDITURE BREAKDOWN: Inventory: $${expendituresByCategory.inventory_purchases.toFixed(2)}, Operating: $${expendituresByCategory.operating_expenses.toFixed(2)}, Other: $${expendituresByCategory.other.toFixed(2)}`);
      
      res.json(report);
    } catch (error) {
      console.error("Error generating profit & loss report:", error);
      res.status(500).json({ 
        message: "Failed to generate profit & loss report",
        error: error.message 
      });
    }
  });

  // Get accounting summary (for dashboard widgets)
  app.get("/api/accounting/summary", isAuthenticated, async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }
      
      const allPayments = await storage.getPayments();
      
      // Filter by date range
      const filteredPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= startDate;
      });
      
      // Calculate totals
      const incomePayments = filteredPayments.filter(payment => 
        payment.type !== 'expenditure' && payment.source !== 'expenditure'
      );
      const expenditurePayments = filteredPayments.filter(payment => 
        payment.type === 'expenditure' || payment.source === 'expenditure'
      );
      
      const totalIncome = incomePayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      const totalExpenditures = expenditurePayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      
      res.json({
        period,
        totalIncome,
        totalExpenditures,
        netProfit: totalIncome - totalExpenditures,
        incomeTransactions: incomePayments.length,
        expenditureTransactions: expenditurePayments.length,
        totalTransactions: filteredPayments.length
      });
    } catch (error) {
      console.error("Error generating accounting summary:", error);
      res.status(500).json({ 
        message: "Failed to generate accounting summary",
        error: error.message 
      });
    }
  });

  // Get cash flow report
  app.get("/api/accounting/cash-flow", isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate as string || new Date().toISOString().split('T')[0];
      
      const allPayments = await storage.getPayments();
      
      // Filter by date range and group by date
      const dailyCashFlow = {};
      
      allPayments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        
        if (paymentDate >= startDateObj && paymentDate <= endDateObj) {
          const dateKey = paymentDate.toISOString().split('T')[0];
          
          if (!dailyCashFlow[dateKey]) {
            dailyCashFlow[dateKey] = { income: 0, expenditures: 0, net: 0 };
          }
          
          const amount = parseFloat(payment.amount || "0");
          
          if (payment.type === 'expenditure' || payment.source === 'expenditure') {
            dailyCashFlow[dateKey].expenditures += amount;
          } else {
            dailyCashFlow[dateKey].income += amount;
          }
          
          dailyCashFlow[dateKey].net = dailyCashFlow[dateKey].income - dailyCashFlow[dateKey].expenditures;
        }
      });
      
      // Convert to array format for charts
      const cashFlowData = Object.entries(dailyCashFlow).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      res.json({
        period: { startDate: start, endDate: end },
        dailyCashFlow: cashFlowData,
        totalInflow: cashFlowData.reduce((sum, day) => sum + day.income, 0),
        totalOutflow: cashFlowData.reduce((sum, day) => sum + day.expenditures, 0),
        netCashFlow: cashFlowData.reduce((sum, day) => sum + day.net, 0)
      });
    } catch (error) {
      console.error("Error generating cash flow report:", error);
      res.status(500).json({ 
        message: "Failed to generate cash flow report",
        error: error.message 
      });
    }
  });
}