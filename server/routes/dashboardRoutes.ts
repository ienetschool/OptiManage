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
import { isAuthenticated } from "../oauthAuth";

export function registerDashboardRoutes(app: Express) {
  // Enhanced dashboard data endpoint
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      // Simplified dashboard for testing - return static data initially
      const dashboardData = {
        totalAppointments: 25,
        totalPatients: 150,
        totalSales: 45,
        totalRevenue: 12450.75,
        appointmentsToday: 8,
        lowStockItems: 3,
        recentAppointments: [
          {
            id: "1",
            appointmentDate: new Date().toISOString(),
            service: "Eye Exam",
            status: "confirmed",
            customerName: "John Doe",
            customerEmail: "john@example.com",
            notes: "Regular checkup"
          }
        ],
        recentSales: [
          {
            id: "1",
            total: 299.99,
            paymentMethod: "card",
            createdAt: new Date().toISOString(),
            customerName: "Jane Smith",
            customerEmail: "jane@example.com"
          }
        ],
        systemHealth: 98,
        pendingInvoices: 12
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