import type { Express } from "express";
import { 
  staff, 
  attendance, 
  leaveRequests, 
  payroll, 
  notifications,
  insertStaffSchema,
  insertNotificationSchema,
} from "../shared/mysql-schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { isAuthenticated } from "./oauthAuth";
import QRCode from "qrcode";
import { format } from "date-fns";
import { z } from "zod";

// Custom staff schema with proper date handling
const customInsertStaffSchema = insertStaffSchema.extend({
  hireDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
}).refine((data) => {
  // Ensure required fields are present
  return data.employeeId && data.firstName && data.lastName;
}, {
  message: "employeeId, firstName, and lastName are required"
});

export function registerHRRoutes(app: Express) {
  // Staff Management Routes
  app.get("/api/staff", isAuthenticated, async (req, res) => {
    try {
      const staffList = await db.select().from(staff).orderBy(desc(staff.createdAt));
      res.json(staffList);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", isAuthenticated, async (req, res) => {
    try {
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      
      // Generate employeeId if not provided
      const employeeId = req.body.employeeId || `EMP${Date.now()}`;
      
      // Convert date strings to Date objects before validation
      const processedData = {
        ...req.body,
        employeeId,
        hireDate: req.body.hireDate ? req.body.hireDate : undefined, // Keep as string for custom schema
      };
      
      console.log('Processed data:', JSON.stringify(processedData, null, 2));
      
      const validatedData = customInsertStaffSchema.parse(processedData);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      
      const result = await db.insert(staff).values(validatedData);
      const [newStaff] = await db.select().from(staff).where(eq(staff.employeeId, validatedData.employeeId)).limit(1);
      res.json(newStaff);
    } catch (error) {
      console.error('Error creating staff:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      res.status(500).json({ message: 'Failed to create staff' });
    }
  });

  // Basic attendance route
  app.get("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const attendanceList = await db.select().from(attendance).orderBy(desc(attendance.createdAt));
      res.json(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Basic payroll route
  app.get("/api/payroll", isAuthenticated, async (req, res) => {
    try {
      const payrollList = await db.select().from(payroll).orderBy(desc(payroll.createdAt));
      res.json(payrollList);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  // Basic leave requests route  
  app.get("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const leaveRequestsList = await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
      res.json(leaveRequestsList);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });
}