import type { Express } from "express";
import { isAuthenticated } from "../oauthAuth";
import { z } from "zod";
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const analyticsQuerySchema = z.object({
  type: z.enum(['sales', 'patients', 'inventory', 'financial', 'staff']),
  store: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
});

export function registerAnalyticsRoutes(app: Express) {
  // Advanced analytics endpoint
  app.get('/api/analytics/advanced', isAuthenticated, async (req, res) => {
    try {
      const { type, store, from, to } = analyticsQuerySchema.parse(req.query);
      
      const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = to ? new Date(to) : new Date();

      let analyticsData;

      switch (type) {
        case 'sales':
          analyticsData = await getSalesAnalytics(store, startDate, endDate);
          break;
        case 'patients':
          analyticsData = await getPatientAnalytics(store, startDate, endDate);
          break;
        case 'inventory':
          analyticsData = await getInventoryAnalytics(store, startDate, endDate);
          break;
        case 'financial':
          analyticsData = await getFinancialAnalytics(store, startDate, endDate);
          break;
        case 'staff':
          analyticsData = await getStaffAnalytics(store, startDate, endDate);
          break;
        default:
          return res.status(400).json({ message: 'Invalid analytics type' });
      }

      res.json(analyticsData);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  // Export endpoint
  app.get('/api/analytics/export', isAuthenticated, async (req, res) => {
    try {
      const { type, format, store, from, to } = req.query as any;
      
      const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = to ? new Date(to) : new Date();

      let data;
      switch (type) {
        case 'sales':
          data = await getSalesAnalytics(store, startDate, endDate);
          break;
        case 'patients':
          data = await getPatientAnalytics(store, startDate, endDate);
          break;
        case 'inventory':
          data = await getInventoryAnalytics(store, startDate, endDate);
          break;
        case 'financial':
          data = await getFinancialAnalytics(store, startDate, endDate);
          break;
        case 'staff':
          data = await getStaffAnalytics(store, startDate, endDate);
          break;
        default:
          return res.status(400).json({ message: 'Invalid analytics type' });
      }

      switch (format) {
        case 'pdf':
          await exportToPDF(res, data, type, startDate, endDate);
          break;
        case 'excel':
          await exportToExcel(res, data, type, startDate, endDate);
          break;
        case 'csv':
          await exportToCSV(res, data, type, startDate, endDate);
          break;
        default:
          return res.status(400).json({ message: 'Invalid export format' });
      }
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Dashboard analytics summary
  app.get('/api/analytics/dashboard', isAuthenticated, async (req, res) => {
    try {
      const summary = {
        totalSales: 485000,
        totalRevenue: 333000,
        totalPatients: 1245,
        newPatients: 187,
        averageOrderValue: 285,
        conversionRate: 68.5,
        returnRate: 76.3,
        averageVisitValue: 320,
        topSellingProducts: [
          { name: 'Designer Frames', sales: 150, revenue: 45000 },
          { name: 'Progressive Lenses', sales: 120, revenue: 36000 },
          { name: 'Contact Lenses', sales: 200, revenue: 18000 },
          { name: 'Sunglasses', sales: 80, revenue: 24000 }
        ],
        monthlyTrends: [
          { month: 'Jan', sales: 65000, revenue: 45000, patients: 120 },
          { month: 'Feb', sales: 75000, revenue: 52000, patients: 140 },
          { month: 'Mar', sales: 85000, revenue: 59000, patients: 160 },
          { month: 'Apr', sales: 70000, revenue: 48000, patients: 135 },
          { month: 'May', sales: 90000, revenue: 63000, patients: 175 },
          { month: 'Jun', sales: 95000, revenue: 66000, patients: 180 }
        ]
      };

      res.json(summary);
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
    }
  });
}

// Analytics data generators
async function getSalesAnalytics(store?: string, startDate?: Date, endDate?: Date) {
  return {
    kpis: {
      totalSales: 485000,
      totalRevenue: 333000,
      averageOrderValue: 285,
      conversionRate: 68.5,
      growth: {
        sales: 12.5,
        revenue: 8.2,
        orderValue: 5.1,
        conversion: 2.1
      }
    },
    trends: [
      { month: 'Jan', sales: 65000, revenue: 45000, orders: 228 },
      { month: 'Feb', sales: 75000, revenue: 52000, orders: 263 },
      { month: 'Mar', sales: 85000, revenue: 59000, orders: 298 },
      { month: 'Apr', sales: 70000, revenue: 48000, orders: 246 },
      { month: 'May', sales: 90000, revenue: 63000, orders: 316 },
      { month: 'Jun', sales: 95000, revenue: 66000, orders: 333 }
    ],
    products: [
      { name: 'Frames', value: 45, revenue: 180000 },
      { name: 'Lenses', value: 30, revenue: 120000 },
      { name: 'Contact Lenses', value: 15, revenue: 60000 },
      { name: 'Accessories', value: 10, revenue: 40000 }
    ],
    stores: store === 'all' ? [
      { name: 'Downtown Vision Center', sales: 200000, revenue: 140000 },
      { name: 'Mall Optical Store', sales: 180000, revenue: 126000 },
      { name: 'Suburban Eye Care', sales: 105000, revenue: 67000 }
    ] : []
  };
}

async function getPatientAnalytics(store?: string, startDate?: Date, endDate?: Date) {
  return {
    kpis: {
      totalPatients: 1245,
      newPatients: 187,
      returnRate: 76.3,
      averageVisitValue: 320,
      growth: {
        total: 18.2,
        new: 22.4,
        return: 4.1,
        visitValue: 7.8
      }
    },
    demographics: [
      { age: '18-25', count: 45, percentage: 15 },
      { age: '26-35', count: 90, percentage: 30 },
      { age: '36-45', count: 75, percentage: 25 },
      { age: '46-55', count: 60, percentage: 20 },
      { age: '56+', count: 30, percentage: 10 }
    ],
    trends: [
      { month: 'Jan', patients: 120, new: 25, returning: 95 },
      { month: 'Feb', patients: 140, new: 32, returning: 108 },
      { month: 'Mar', patients: 160, new: 38, returning: 122 },
      { month: 'Apr', patients: 135, new: 28, returning: 107 },
      { month: 'May', patients: 175, new: 42, returning: 133 },
      { month: 'Jun', patients: 180, new: 45, returning: 135 }
    ],
    conditions: [
      { condition: 'Myopia', count: 425, percentage: 34.1 },
      { condition: 'Hyperopia', count: 312, percentage: 25.1 },
      { condition: 'Astigmatism', count: 298, percentage: 23.9 },
      { condition: 'Presbyopia', count: 210, percentage: 16.9 }
    ]
  };
}

async function getInventoryAnalytics(store?: string, startDate?: Date, endDate?: Date) {
  return {
    kpis: {
      totalProducts: 1250,
      lowStockItems: 45,
      outOfStock: 12,
      turnoverRate: 4.2,
      growth: {
        products: 8.5,
        turnover: 12.3,
        stockValue: 15.7
      }
    },
    categories: [
      { category: 'Frames', stock: 450, value: 180000, turnover: 5.2 },
      { category: 'Lenses', stock: 320, value: 96000, turnover: 6.8 },
      { category: 'Contact Lenses', stock: 280, value: 42000, turnover: 8.4 },
      { category: 'Accessories', stock: 200, value: 24000, turnover: 3.1 }
    ],
    lowStock: [
      { product: 'Ray-Ban Aviator', current: 5, minimum: 20, status: 'Critical' },
      { product: 'Progressive Lenses', current: 12, minimum: 25, status: 'Low' },
      { product: 'Daily Contacts', current: 8, minimum: 30, status: 'Critical' }
    ]
  };
}

async function getFinancialAnalytics(store?: string, startDate?: Date, endDate?: Date) {
  return {
    kpis: {
      totalRevenue: 485000,
      grossProfit: 291000,
      netProfit: 145500,
      profitMargin: 30.0,
      growth: {
        revenue: 12.5,
        profit: 8.8,
        margin: 2.3
      }
    },
    breakdown: {
      revenue: {
        products: 388000,
        services: 67000,
        insurance: 30000
      },
      expenses: {
        inventory: 194000,
        salaries: 98000,
        rent: 24000,
        utilities: 12000,
        marketing: 8000,
        other: 9500
      }
    },
    trends: [
      { month: 'Jan', revenue: 65000, profit: 19500, margin: 30.0 },
      { month: 'Feb', revenue: 75000, profit: 22500, margin: 30.0 },
      { month: 'Mar', revenue: 85000, profit: 25500, margin: 30.0 },
      { month: 'Apr', revenue: 70000, profit: 21000, margin: 30.0 },
      { month: 'May', revenue: 90000, profit: 27000, margin: 30.0 },
      { month: 'Jun', revenue: 95000, profit: 28500, margin: 30.0 }
    ]
  };
}

async function getStaffAnalytics(store?: string, startDate?: Date, endDate?: Date) {
  return {
    kpis: {
      totalStaff: 24,
      averagePerformance: 87.5,
      customerSatisfaction: 4.6,
      productivity: 92.3,
      growth: {
        performance: 5.2,
        satisfaction: 3.1,
        productivity: 7.8
      }
    },
    performance: [
      { name: 'Dr. Sarah Johnson', role: 'Optometrist', score: 95, sales: 85000 },
      { name: 'Mike Chen', role: 'Sales Associate', score: 92, sales: 72000 },
      { name: 'Emily Davis', role: 'Optician', score: 88, sales: 65000 },
      { name: 'James Wilson', role: 'Sales Associate', score: 85, sales: 58000 }
    ],
    attendance: [
      { month: 'Jan', present: 92, absent: 8, late: 3 },
      { month: 'Feb', present: 94, absent: 6, late: 2 },
      { month: 'Mar', present: 91, absent: 9, late: 4 },
      { month: 'Apr', present: 95, absent: 5, late: 1 },
      { month: 'May', present: 93, absent: 7, late: 3 },
      { month: 'Jun', present: 96, absent: 4, late: 2 }
    ]
  };
}

// Export functions
async function exportToPDF(res: any, data: any, type: string, startDate: Date, endDate: Date) {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_report.pdf"`);
  
  doc.pipe(res);
  
  // Add title
  doc.fontSize(20).text(`${type.toUpperCase()} Analytics Report`, 50, 50);
  doc.fontSize(12).text(`Period: ${startDate.toDateString()} to ${endDate.toDateString()}`, 50, 80);
  
  // Add content based on data
  let yPosition = 120;
  
  if (data.kpis) {
    doc.fontSize(16).text('Key Performance Indicators', 50, yPosition);
    yPosition += 30;
    
    Object.entries(data.kpis).forEach(([key, value]) => {
      if (typeof value === 'number') {
        doc.fontSize(12).text(`${key}: ${value}`, 50, yPosition);
        yPosition += 20;
      }
    });
  }
  
  doc.end();
}

async function exportToExcel(res: any, data: any, type: string, startDate: Date, endDate: Date) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${type} Analytics`);
  
  // Add headers
  worksheet.addRow([`${type.toUpperCase()} Analytics Report`]);
  worksheet.addRow([`Period: ${startDate.toDateString()} to ${endDate.toDateString()}`]);
  worksheet.addRow([]);
  
  // Add KPIs
  if (data.kpis) {
    worksheet.addRow(['Key Performance Indicators']);
    Object.entries(data.kpis).forEach(([key, value]) => {
      if (typeof value === 'number') {
        worksheet.addRow([key, value]);
      }
    });
    worksheet.addRow([]);
  }
  
  // Add trends data
  if (data.trends) {
    worksheet.addRow(['Monthly Trends']);
    const headers = Object.keys(data.trends[0] || {});
    worksheet.addRow(headers);
    
    data.trends.forEach((trend: any) => {
      worksheet.addRow(headers.map(header => trend[header]));
    });
  }
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_report.xlsx"`);
  
  await workbook.xlsx.write(res);
  res.end();
}

async function exportToCSV(res: any, data: any, type: string, startDate: Date, endDate: Date) {
  let csv = `${type.toUpperCase()} Analytics Report\n`;
  csv += `Period: ${startDate.toDateString()} to ${endDate.toDateString()}\n\n`;
  
  // Add KPIs
  if (data.kpis) {
    csv += 'Key Performance Indicators\n';
    Object.entries(data.kpis).forEach(([key, value]) => {
      if (typeof value === 'number') {
        csv += `${key},${value}\n`;
      }
    });
    csv += '\n';
  }
  
  // Add trends data
  if (data.trends) {
    csv += 'Monthly Trends\n';
    const headers = Object.keys(data.trends[0] || {});
    csv += headers.join(',') + '\n';
    
    data.trends.forEach((trend: any) => {
      csv += headers.map(header => trend[header]).join(',') + '\n';
    });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
  res.send(csv);
}