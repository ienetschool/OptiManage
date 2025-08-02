import type { Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { appointments, insertAppointmentSchema } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { isAuthenticated } from "../simpleAuth";

const appointmentQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  storeId: z.string().optional(),
  status: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  recent: z.string().transform(Boolean).optional(),
});

export function registerAppointmentRoutes(app: Express) {
  // Get all appointments with filters
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const query = appointmentQuerySchema.parse(req.query);
      
      let dbQuery = db.select().from(appointments);

      // Apply filters
      const conditions = [];
      
      if (query.startDate) {
        conditions.push(gte(appointments.appointmentDate, new Date(query.startDate)));
      }
      
      if (query.endDate) {
        conditions.push(lte(appointments.appointmentDate, new Date(query.endDate)));
      }
      
      if (query.customerId) {
        conditions.push(eq(appointments.customerId, query.customerId));
      }
      
      if (query.storeId) {
        conditions.push(eq(appointments.storeId, query.storeId));
      }
      
      if (query.status) {
        conditions.push(eq(appointments.status, query.status));
      }

      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }

      // Apply ordering
      if (query.recent) {
        dbQuery = dbQuery.orderBy(desc(appointments.createdAt));
      } else {
        dbQuery = dbQuery.orderBy(appointments.appointmentDate);
      }

      // Apply limit
      if (query.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }

      const result = await dbQuery;
      res.json(result);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get appointment by ID
  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [appointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  // Create new appointment
  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Only assign doctors for PAID appointments - pending appointments should not have doctor assignment
      if (validatedData.assignedDoctorId) {
        if (validatedData.paymentStatus === 'paid') {
          console.log(`✅ PAID APPOINTMENT - Doctor ${validatedData.assignedDoctorId} assigned automatically`);
        } else if (validatedData.paymentStatus === 'pending') {
          // For pending payments, remove doctor assignment - doctor will be assigned when payment is completed
          console.log(`⚠️ PENDING PAYMENT - Removing doctor assignment. Doctor will be assigned when payment is completed.`);
          validatedData.assignedDoctorId = null;
        } else {
          // For other payment statuses, preserve assignment but log
          console.log(`Doctor ${validatedData.assignedDoctorId} assigned to ${validatedData.paymentStatus} appointment`);
        }
      }
      
      const [appointment] = await db
        .insert(appointments)
        .values(validatedData)
        .returning();

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAppointmentSchema.partial().parse(req.body);

      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Delete appointment
  app.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;

      const [deletedAppointment] = await db
        .delete(appointments)
        .where(eq(appointments.id, id))
        .returning();

      if (!deletedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
}