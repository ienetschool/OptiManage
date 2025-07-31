import type { Express } from "express";
import { db } from "../db";
import { 
  appointments, 
  customers, 
  sales, 
  products, 
  storeInventory, 
  stores,
  users 
} from "@shared/schema";
import { count, desc, eq, gte, sum, sql, and } from "drizzle-orm";
import { isAuthenticated } from "../simpleAuth";

export function registerDashboardRoutes(app: Express) {
  // Enhanced dashboard data endpoint
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const { storeId, dateRange = "30d" } = req.query;
      
      // Calculate date range
      const startDate = new Date();
      switch (dateRange) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Base condition for store filtering
      const storeCondition = storeId && storeId !== "all" ? eq(appointments.storeId, storeId as string) : undefined;
      const salesStoreCondition = storeId && storeId !== "all" ? eq(sales.storeId, storeId as string) : undefined;

      // Get total appointments
      const appointmentsQuery = db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            gte(appointments.createdAt, startDate),
            storeCondition
          )
        );

      // Get total customers/patients
      const customersQuery = db
        .select({ count: count() })
        .from(customers);

      // Get total sales and revenue
      const salesQuery = db
        .select({ 
          count: count(),
          revenue: sum(sales.total)
        })
        .from(sales)
        .where(
          and(
            gte(sales.createdAt, startDate),
            salesStoreCondition
          )
        );

      // Get today's appointments
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayAppointmentsQuery = db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            gte(appointments.appointmentDate, todayStart),
            sql`${appointments.appointmentDate} <= ${todayEnd}`,
            storeCondition
          )
        );

      // Get low stock items
      const lowStockQuery = db
        .select({ count: count() })
        .from(storeInventory)
        .where(sql`${storeInventory.quantity} <= 10`);

      // Get recent appointments
      const recentAppointmentsQuery = db
        .select({
          id: appointments.id,
          appointmentDate: appointments.appointmentDate,
          service: appointments.service,
          status: appointments.status,
          customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
          customerEmail: customers.email,
          notes: appointments.notes
        })
        .from(appointments)
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .where(storeCondition)
        .orderBy(desc(appointments.createdAt))
        .limit(5);

      // Get recent sales
      const recentSalesQuery = db
        .select({
          id: sales.id,
          total: sales.total,
          paymentMethod: sales.paymentMethod,
          createdAt: sales.createdAt,
          customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
          customerEmail: customers.email
        })
        .from(sales)
        .leftJoin(customers, eq(sales.customerId, customers.id))
        .where(salesStoreCondition)
        .orderBy(desc(sales.createdAt))
        .limit(5);

      // Execute all queries
      const [
        appointmentsResult,
        customersResult,
        salesResult,
        todayAppointmentsResult,
        lowStockResult,
        recentAppointments,
        recentSales
      ] = await Promise.all([
        appointmentsQuery,
        customersQuery,
        salesQuery,
        todayAppointmentsQuery,
        lowStockQuery,
        recentAppointmentsQuery,
        recentSalesQuery
      ]);

      const dashboardData = {
        totalAppointments: appointmentsResult[0]?.count || 0,
        totalPatients: customersResult[0]?.count || 0,
        totalSales: salesResult[0]?.count || 0,
        totalRevenue: Number(salesResult[0]?.revenue) || 0,
        appointmentsToday: todayAppointmentsResult[0]?.count || 0,
        lowStockItems: lowStockResult[0]?.count || 0,
        recentAppointments: recentAppointments.map(apt => ({
          ...apt,
          customerName: apt.customerName || 'Unknown Patient'
        })),
        recentSales: recentSales.map(sale => ({
          ...sale,
          customerName: sale.customerName || 'Walk-in Customer',
          total: Number(sale.total)
        })),
        systemHealth: 98, // Mock for now
        pendingInvoices: 12 // Mock for now
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Analytics data endpoint
  app.get("/api/analytics", isAuthenticated, async (req, res) => {
    try {
      const { storeId, dateRange = "30d" } = req.query;

      // Calculate date ranges for comparison
      const endDate = new Date();
      const startDate = new Date();
      const previousStartDate = new Date();
      const previousEndDate = new Date();

      switch (dateRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          previousStartDate.setDate(endDate.getDate() - 14);
          previousEndDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          previousStartDate.setDate(endDate.getDate() - 60);
          previousEndDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          previousStartDate.setDate(endDate.getDate() - 180);
          previousEndDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          previousStartDate.setFullYear(endDate.getFullYear() - 2);
          previousEndDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const storeCondition = storeId && storeId !== "all" ? eq(appointments.storeId, storeId as string) : undefined;
      const salesStoreCondition = storeId && storeId !== "all" ? eq(sales.storeId, storeId as string) : undefined;

      // Current period metrics
      const currentRevenue = await db
        .select({ revenue: sum(sales.total) })
        .from(sales)
        .where(
          and(
            gte(sales.createdAt, startDate),
            salesStoreCondition
          )
        );

      const currentPatients = await db
        .select({ count: count() })
        .from(customers)
        .where(gte(customers.createdAt, startDate));

      const currentAppointments = await db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            gte(appointments.createdAt, startDate),
            storeCondition
          )
        );

      // Previous period metrics for comparison
      const previousRevenue = await db
        .select({ revenue: sum(sales.total) })
        .from(sales)
        .where(
          and(
            gte(sales.createdAt, previousStartDate),
            sql`${sales.createdAt} < ${previousEndDate}`,
            salesStoreCondition
          )
        );

      const previousPatients = await db
        .select({ count: count() })
        .from(customers)
        .where(
          and(
            gte(customers.createdAt, previousStartDate),
            sql`${customers.createdAt} < ${previousEndDate}`
          )
        );

      const previousAppointments = await db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            gte(appointments.createdAt, previousStartDate),
            sql`${appointments.createdAt} < ${previousEndDate}`,
            storeCondition
          )
        );

      // Calculate growth percentages
      const revenueGrowth = calculateGrowth(
        Number(currentRevenue[0]?.revenue) || 0,
        Number(previousRevenue[0]?.revenue) || 0
      );

      const patientGrowth = calculateGrowth(
        currentPatients[0]?.count || 0,
        previousPatients[0]?.count || 0
      );

      const appointmentGrowth = calculateGrowth(
        currentAppointments[0]?.count || 0,
        previousAppointments[0]?.count || 0
      );

      const analyticsData = {
        totalRevenue: Number(currentRevenue[0]?.revenue) || 0,
        totalPatients: currentPatients[0]?.count || 0,
        totalAppointments: currentAppointments[0]?.count || 0,
        revenueGrowth,
        patientGrowth,
        appointmentGrowth,
        averageRevenue: currentPatients[0]?.count > 0 
          ? Math.round((Number(currentRevenue[0]?.revenue) || 0) / (currentPatients[0].count))
          : 0,
        conversionRate: 87.5, // Mock for now
        patientRetention: 92.3, // Mock for now
        noShowRate: 4.2 // Mock for now
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}