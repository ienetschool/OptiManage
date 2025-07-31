import type { Express } from "express";
import { 
  staff, 
  attendance, 
  leaveRequests, 
  payroll, 
  notificationsTable,
  insertStaffSchema,
  insertAttendanceSchema,
  insertLeaveRequestSchema,
  insertPayrollSchema,
  insertNotificationHRSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, sql } from "drizzle-orm";
import { isAuthenticated } from "./simpleAuth";
import QRCode from "qrcode";
import { format } from "date-fns";

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
      const validatedData = insertStaffSchema.parse(req.body);
      const [newStaff] = await db.insert(staff).values(validatedData).returning();
      res.json(newStaff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  app.put("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const [updatedStaff] = await db
        .update(staff)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(staff.id, req.params.id))
        .returning();
      
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(updatedStaff);
    } catch (error) {
      console.error("Error updating staff:", error);
      res.status(500).json({ message: "Failed to update staff" });
    }
  });

  // Attendance Management Routes
  app.get("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const { staffId, date, month, year } = req.query;
      
      let query = db.select().from(attendance);
      const conditions = [];
      
      if (staffId) {
        conditions.push(eq(attendance.staffId, staffId as string));
      }
      
      if (date) {
        conditions.push(eq(attendance.date, date as string));
      }
      
      if (month && year) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
        conditions.push(and(
          gte(attendance.date, startDate),
          lte(attendance.date, endDate)
        ));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const attendanceList = await query.orderBy(desc(attendance.date));
      res.json(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance/check-in", isAuthenticated, async (req, res) => {
    try {
      const { staffId, method, location } = req.body;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if already checked in today
      const [existingAttendance] = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.staffId, staffId),
          eq(attendance.date, today)
        ));
      
      if (existingAttendance && existingAttendance.checkInTime) {
        return res.status(400).json({ message: "Already checked in today" });
      }
      
      const checkInTime = new Date();
      
      // Generate QR code for verification
      const qrCodeData = `${req.protocol}://${req.hostname}/verify/attendance/${staffId}/${today}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      
      const attendanceData = {
        staffId,
        storeId: req.body.storeId,
        date: today,
        checkInTime,
        checkInMethod: method || 'manual',
        checkInLocation: location ? JSON.stringify(location) : null,
        status: 'present',
        qrCode: qrCodeUrl
      };
      
      if (existingAttendance) {
        // Update existing record
        const [updatedAttendance] = await db
          .update(attendance)
          .set(attendanceData)
          .where(eq(attendance.id, existingAttendance.id))
          .returning();
        
        res.json(updatedAttendance);
      } else {
        // Create new record
        const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
        res.json(newAttendance);
      }
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.post("/api/attendance/check-out", isAuthenticated, async (req, res) => {
    try {
      const { staffId, method, location } = req.body;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [existingAttendance] = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.staffId, staffId),
          eq(attendance.date, today)
        ));
      
      if (!existingAttendance || !existingAttendance.checkInTime) {
        return res.status(400).json({ message: "Must check in first" });
      }
      
      if (existingAttendance.checkOutTime) {
        return res.status(400).json({ message: "Already checked out today" });
      }
      
      const checkOutTime = new Date();
      const checkInTime = new Date(existingAttendance.checkInTime);
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      
      const [updatedAttendance] = await db
        .update(attendance)
        .set({
          checkOutTime,
          checkOutMethod: method || 'manual',
          checkOutLocation: location ? JSON.stringify(location) : null,
          totalHours: totalHours.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(attendance.id, existingAttendance.id))
        .returning();
      
      res.json(updatedAttendance);
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  // Leave Management Routes
  app.get("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const { staffId, status, managerId } = req.query;
      
      let query = db.select().from(leaveRequests);
      const conditions = [];
      
      if (staffId) {
        conditions.push(eq(leaveRequests.staffId, staffId as string));
      }
      
      if (status) {
        conditions.push(eq(leaveRequests.status, status as string));
      }
      
      if (managerId) {
        conditions.push(eq(leaveRequests.managerId, managerId as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const leaves = await query.orderBy(desc(leaveRequests.appliedDate));
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      
      // Calculate total days
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const leaveData = {
        ...validatedData,
        leaveNumber: `LV-${Date.now().toString().slice(-6)}`,
        totalDays
      };
      
      const [newLeave] = await db.insert(leaveRequests).values(leaveData).returning();
      
      // Send notification to manager
      if (newLeave.managerId) {
        await db.insert(notificationsTable).values({
          recipientId: newLeave.managerId,
          title: "New Leave Request",
          message: `${validatedData.leaveType} leave request from staff member`,
          type: "hr",
          priority: "normal",
          relatedType: "leave",
          relatedId: newLeave.id
        });
      }
      
      res.json(newLeave);
    } catch (error) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.put("/api/leave-requests/:id/review", isAuthenticated, async (req, res) => {
    try {
      const { status, reviewComments } = req.body;
      const userId = req.user?.claims?.sub;
      
      const [updatedLeave] = await db
        .update(leaveRequests)
        .set({
          status,
          reviewComments,
          reviewedDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(leaveRequests.id, req.params.id))
        .returning();
      
      if (!updatedLeave) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      
      // Send notification to staff member
      await db.insert(notificationsTable).values({
        recipientId: updatedLeave.staffId,
        title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your ${updatedLeave.leaveType} leave request has been ${status}`,
        type: "hr",
        priority: status === 'approved' ? 'normal' : 'high',
        relatedType: "leave",
        relatedId: updatedLeave.id
      });
      
      res.json(updatedLeave);
    } catch (error) {
      console.error("Error reviewing leave request:", error);
      res.status(500).json({ message: "Failed to review leave request" });
    }
  });

  // Payroll Management Routes
  app.get("/api/payroll", isAuthenticated, async (req, res) => {
    try {
      const { staffId, month, year, status } = req.query;
      
      let query = db.select().from(payroll);
      const conditions = [];
      
      if (staffId) {
        conditions.push(eq(payroll.staffId, staffId as string));
      }
      
      if (month) {
        conditions.push(eq(payroll.payMonth, parseInt(month as string)));
      }
      
      if (year) {
        conditions.push(eq(payroll.payYear, parseInt(year as string)));
      }
      
      if (status) {
        conditions.push(eq(payroll.status, status as string));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const payrollList = await query.orderBy(desc(payroll.createdAt));
      res.json(payrollList);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      
      // Calculate net salary
      const allowancesTotal = Object.values(validatedData.allowances || {}).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
      const deductionsTotal = Object.values(validatedData.deductions || {}).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
      
      const grossSalary = parseFloat(validatedData.basicSalary) + allowancesTotal + parseFloat(validatedData.overtime || '0') + parseFloat(validatedData.bonus || '0');
      const netSalary = grossSalary - deductionsTotal;
      
      // Generate QR code for payslip verification
      const payrollNumber = `PAY-${Date.now().toString().slice(-6)}`;
      const qrCodeData = `${req.protocol}://${req.hostname}/verify/payslip/${payrollNumber}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      
      const payrollData = {
        ...validatedData,
        payrollNumber,
        grossSalary: grossSalary.toFixed(2),
        totalDeductions: deductionsTotal.toFixed(2),
        netSalary: netSalary.toFixed(2),
        qrCode: qrCodeUrl
      };
      
      const [newPayroll] = await db.insert(payroll).values(payrollData).returning();
      
      // Send notification to staff member
      await db.insert(notificationsTable).values({
        recipientId: newPayroll.staffId,
        title: "Payslip Generated",
        message: `Your payslip for ${format(new Date(newPayroll.payYear, newPayroll.payMonth - 1), 'MMMM yyyy')} is ready`,
        type: "hr",
        priority: "normal",
        relatedType: "payroll",
        relatedId: newPayroll.id
      });
      
      res.json(newPayroll);
    } catch (error) {
      console.error("Error creating payroll:", error);
      res.status(500).json({ message: "Failed to create payroll" });
    }
  });

  // Generate Payslip PDF
  app.post("/api/payroll/:id/generate-payslip", isAuthenticated, async (req, res) => {
    try {
      const [payrollRecord] = await db.select().from(payroll).where(eq(payroll.id, req.params.id));
      
      if (!payrollRecord) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      
      // Here you would implement PDF generation
      // For now, we'll simulate it
      const payslipUrl = `/downloads/payslip-${payrollRecord.payrollNumber}.pdf`;
      
      await db
        .update(payroll)
        .set({
          payslipGenerated: true,
          payslipUrl,
          updatedAt: new Date()
        })
        .where(eq(payroll.id, req.params.id));
      
      res.json({ 
        message: "Payslip generated successfully", 
        downloadUrl: payslipUrl,
        qrCode: payrollRecord.qrCode
      });
    } catch (error) {
      console.error("Error generating payslip:", error);
      res.status(500).json({ message: "Failed to generate payslip" });
    }
  });

  // Notifications Routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      // For now, return sample notifications since we're using string user IDs
      const sampleNotifications = [
        {
          id: "1",
          recipientId: req.user?.claims?.sub,
          title: "Welcome to HR System",
          message: "Your HR management system is now active.",
          type: "hr",
          priority: "normal",
          isRead: false,
          sentAt: new Date().toISOString(),
          relatedType: null,
          relatedId: null
        },
        {
          id: "2", 
          recipientId: req.user?.claims?.sub,
          title: "Payroll Reminder",
          message: "Monthly payroll processing is due.",
          type: "hr",
          priority: "high",
          isRead: false,
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          relatedType: "payroll",
          relatedId: "sample"
        }
      ];
      
      res.json(sampleNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      // For sample notifications, just return success since they're not in database
      const { id } = req.params;
      if (id === "1" || id === "2") {
        return res.json({ success: true, message: "Notification marked as read" });
      }
      
      // For real database notifications, use UUID format
      const notificationId = id.includes('-') ? id : `00000000-0000-0000-0000-${id.padStart(12, '0')}`;
      const [updatedNotification] = await db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(eq(notificationsTable.id, notificationId))
        .returning();
      
      res.json(updatedNotification || { success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Verification Routes
  app.get("/api/verify/attendance/:staffId/:date", async (req, res) => {
    try {
      const [attendanceRecord] = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.staffId, req.params.staffId),
          eq(attendance.date, req.params.date)
        ));
      
      if (!attendanceRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      res.json({
        staffId: attendanceRecord.staffId,
        date: attendanceRecord.date,
        checkInTime: attendanceRecord.checkInTime,
        checkOutTime: attendanceRecord.checkOutTime,
        totalHours: attendanceRecord.totalHours,
        status: attendanceRecord.status,
        verified: true
      });
    } catch (error) {
      console.error("Error verifying attendance:", error);
      res.status(500).json({ message: "Failed to verify attendance" });
    }
  });

  app.get("/api/verify/payslip/:payrollNumber", async (req, res) => {
    try {
      const [payrollRecord] = await db
        .select()
        .from(payroll)
        .where(eq(payroll.payrollNumber, req.params.payrollNumber));
      
      if (!payrollRecord) {
        return res.status(404).json({ message: "Payslip not found" });
      }
      
      res.json({
        payrollNumber: payrollRecord.payrollNumber,
        staffId: payrollRecord.staffId,
        payPeriod: `${format(new Date(payrollRecord.payYear, payrollRecord.payMonth - 1), 'MMMM yyyy')}`,
        netSalary: payrollRecord.netSalary,
        status: payrollRecord.status,
        verified: true
      });
    } catch (error) {
      console.error("Error verifying payslip:", error);
      res.status(500).json({ message: "Failed to verify payslip" });
    }
  });

  // Dashboard Analytics for HR
  app.get("/api/hr/analytics", isAuthenticated, async (req, res) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Total staff count
      const totalStaff = await db.select({ count: sql`count(*)` }).from(staff).where(eq(staff.status, 'active'));
      
      // Today's attendance
      const todayAttendance = await db.select({ count: sql`count(*)` }).from(attendance).where(eq(attendance.date, today));
      
      // Pending leave requests
      const pendingLeaves = await db.select({ count: sql`count(*)` }).from(leaveRequests).where(eq(leaveRequests.status, 'pending'));
      
      // This month's payroll processed
      const monthlyPayroll = await db
        .select({ count: sql`count(*)` })
        .from(payroll)
        .where(and(
          eq(payroll.payMonth, currentMonth),
          eq(payroll.payYear, currentYear),
          eq(payroll.status, 'processed')
        ));
      
      res.json({
        totalStaff: totalStaff[0]?.count || 0,
        todayAttendance: todayAttendance[0]?.count || 0,
        pendingLeaves: pendingLeaves[0]?.count || 0,
        monthlyPayrollProcessed: monthlyPayroll[0]?.count || 0
      });
    } catch (error) {
      console.error("Error fetching HR analytics:", error);
      res.status(500).json({ message: "Failed to fetch HR analytics" });
    }
  });
}