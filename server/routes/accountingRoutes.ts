import { Router } from 'express';
import { db } from '../db';
import { 
  chartOfAccounts, 
  generalLedgerEntries, 
  paymentTransactions, 
  profitLossEntries,
  accountCategories 
} from '../../shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const router = Router();

// Get Chart of Accounts
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const accounts = await db
      .select({
        id: chartOfAccounts.id,
        accountNumber: chartOfAccounts.accountNumber,
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        subType: chartOfAccounts.subType,
        normalBalance: chartOfAccounts.normalBalance,
        isActive: chartOfAccounts.isActive,
        categoryName: accountCategories.name
      })
      .from(chartOfAccounts)
      .leftJoin(accountCategories, eq(chartOfAccounts.categoryId, accountCategories.id))
      .where(eq(chartOfAccounts.isActive, true))
      .orderBy(chartOfAccounts.accountNumber);

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    res.status(500).json({ error: 'Failed to fetch chart of accounts' });
  }
});

// Get Profit & Loss Report
router.get('/profit-loss', async (req, res) => {
  try {
    const { year = 2025, period } = req.query;
    
    const whereClause = period 
      ? and(
          eq(profitLossEntries.fiscalYear, Number(year)),
          eq(profitLossEntries.fiscalPeriod, Number(period))
        )
      : eq(profitLossEntries.fiscalYear, Number(year));

    // Get detailed breakdown
    const entries = await db
      .select({
        entryType: profitLossEntries.entryType,
        category: profitLossEntries.category,
        subCategory: profitLossEntries.subCategory,
        totalAmount: sql<number>`sum(${profitLossEntries.amount})`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(profitLossEntries)
      .where(whereClause)
      .groupBy(
        profitLossEntries.entryType, 
        profitLossEntries.category, 
        profitLossEntries.subCategory
      )
      .orderBy(
        profitLossEntries.entryType,
        sql`sum(${profitLossEntries.amount}) DESC`
      );

    // Calculate totals
    const totals = await db
      .select({
        totalRevenue: sql<number>`sum(case when ${profitLossEntries.entryType} = 'revenue' then ${profitLossEntries.amount} else 0 end)`,
        totalCogs: sql<number>`sum(case when ${profitLossEntries.entryType} = 'cogs' then ${profitLossEntries.amount} else 0 end)`,
        totalExpenses: sql<number>`sum(case when ${profitLossEntries.entryType} = 'expense' then ${profitLossEntries.amount} else 0 end)`,
      })
      .from(profitLossEntries)
      .where(whereClause);

    const summary = totals[0];
    const grossProfit = Number(summary.totalRevenue) - Number(summary.totalCogs);
    const netProfit = grossProfit - Number(summary.totalExpenses);

    res.json({
      period: period ? `${getMonthName(Number(period))} ${year}` : `Year ${year}`,
      summary: {
        totalRevenue: Number(summary.totalRevenue || 0),
        totalCogs: Number(summary.totalCogs || 0),
        grossProfit,
        totalExpenses: Number(summary.totalExpenses || 0),
        netProfit
      },
      breakdown: entries.map(entry => ({
        ...entry,
        totalAmount: Number(entry.totalAmount),
        transactionCount: Number(entry.transactionCount)
      }))
    });
  } catch (error) {
    console.error('Error fetching P&L report:', error);
    res.status(500).json({ error: 'Failed to fetch profit & loss report' });
  }
});

// Get Payment Transactions
router.get('/payment-transactions', async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 50 } = req.query;
    
    let whereClause = sql`1=1`;
    
    if (startDate) {
      whereClause = sql`${whereClause} AND ${paymentTransactions.transactionDate} >= ${startDate}`;
    }
    if (endDate) {
      whereClause = sql`${whereClause} AND ${paymentTransactions.transactionDate} <= ${endDate}`;
    }
    if (type) {
      whereClause = sql`${whereClause} AND ${paymentTransactions.transactionType} = ${type}`;
    }

    const transactions = await db
      .select()
      .from(paymentTransactions)
      .where(whereClause)
      .orderBy(desc(paymentTransactions.transactionDate))
      .limit(Number(limit));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

// Get General Ledger
router.get('/general-ledger', async (req, res) => {
  try {
    const { accountId, startDate, endDate, limit = 100 } = req.query;
    
    let whereClause = sql`1=1`;
    
    if (accountId) {
      whereClause = sql`${whereClause} AND ${generalLedgerEntries.accountId} = ${accountId}`;
    }
    if (startDate) {
      whereClause = sql`${whereClause} AND ${generalLedgerEntries.transactionDate} >= ${startDate}`;
    }
    if (endDate) {
      whereClause = sql`${whereClause} AND ${generalLedgerEntries.transactionDate} <= ${endDate}`;
    }

    const ledgerEntries = await db
      .select({
        id: generalLedgerEntries.id,
        transactionId: generalLedgerEntries.transactionId,
        accountNumber: chartOfAccounts.accountNumber,
        accountName: chartOfAccounts.accountName,
        transactionDate: generalLedgerEntries.transactionDate,
        description: generalLedgerEntries.description,
        referenceType: generalLedgerEntries.referenceType,
        referenceId: generalLedgerEntries.referenceId,
        debitAmount: generalLedgerEntries.debitAmount,
        creditAmount: generalLedgerEntries.creditAmount,
        runningBalance: generalLedgerEntries.runningBalance
      })
      .from(generalLedgerEntries)
      .leftJoin(chartOfAccounts, eq(generalLedgerEntries.accountId, chartOfAccounts.id))
      .where(whereClause)
      .orderBy(desc(generalLedgerEntries.transactionDate))
      .limit(Number(limit));

    res.json(ledgerEntries);
  } catch (error) {
    console.error('Error fetching general ledger:', error);
    res.status(500).json({ error: 'Failed to fetch general ledger' });
  }
});

// Get Financial Dashboard Summary
router.get('/dashboard', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get current month P&L
    const currentMonthPL = await db
      .select({
        totalRevenue: sql<number>`sum(case when ${profitLossEntries.entryType} = 'revenue' then ${profitLossEntries.amount} else 0 end)`,
        totalExpenses: sql<number>`sum(case when ${profitLossEntries.entryType} = 'expense' then ${profitLossEntries.amount} else 0 end)`,
        totalCogs: sql<number>`sum(case when ${profitLossEntries.entryType} = 'cogs' then ${profitLossEntries.amount} else 0 end)`,
      })
      .from(profitLossEntries)
      .where(
        and(
          eq(profitLossEntries.fiscalYear, currentYear),
          eq(profitLossEntries.fiscalPeriod, currentMonth)
        )
      );

    // Get YTD totals
    const ytdTotals = await db
      .select({
        totalRevenue: sql<number>`sum(case when ${profitLossEntries.entryType} = 'revenue' then ${profitLossEntries.amount} else 0 end)`,
        totalExpenses: sql<number>`sum(case when ${profitLossEntries.entryType} = 'expense' then ${profitLossEntries.amount} else 0 end)`,
        totalCogs: sql<number>`sum(case when ${profitLossEntries.entryType} = 'cogs' then ${profitLossEntries.amount} else 0 end)`,
      })
      .from(profitLossEntries)
      .where(eq(profitLossEntries.fiscalYear, currentYear));

    const currentMonth_ = currentMonthPL[0];
    const ytd = ytdTotals[0];

    res.json({
      currentMonth: {
        revenue: Number(currentMonth_.totalRevenue || 0),
        expenses: Number(currentMonth_.totalExpenses || 0),
        cogs: Number(currentMonth_.totalCogs || 0),
        netProfit: Number(currentMonth_.totalRevenue || 0) - Number(currentMonth_.totalExpenses || 0) - Number(currentMonth_.totalCogs || 0)
      },
      yearToDate: {
        revenue: Number(ytd.totalRevenue || 0),
        expenses: Number(ytd.totalExpenses || 0),
        cogs: Number(ytd.totalCogs || 0),
        netProfit: Number(ytd.totalRevenue || 0) - Number(ytd.totalExpenses || 0) - Number(ytd.totalCogs || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

export default router;