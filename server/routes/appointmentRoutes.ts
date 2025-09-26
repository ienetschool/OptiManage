import type { Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { appointments, patients, stores, insertAppointmentSchema } from "@shared/mysql-schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { isAuthenticated } from "../oauthAuth";
import crypto from "crypto";

const appointmentUpdateSchema = z.object({
  service: z.string().min(1, "Service cannot be empty").max(255, "Service name too long").trim().optional(),
  appointmentDate: z.string().datetime("Invalid appointment date format").transform((val) => new Date(val)).or(z.date()).optional(),
  duration: z.number().int().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours").optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"], {
    errorMap: () => ({ message: "Status must be one of: scheduled, confirmed, in_progress, completed, cancelled, no_show" })
  }).optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
  customFields: z.record(z.any()).optional().nullable(),
}).refine((data) => {
  // Ensure at least one field is being updated
  const hasUpdate = Object.values(data).some(value => value !== undefined);
  return hasUpdate;
}, {
  message: "At least one field must be provided for update"
}).refine((data) => {
  // Validate appointment date is not in the past (only for future appointments)
  if (data.appointmentDate) {
    const appointmentDate = data.appointmentDate instanceof Date ? data.appointmentDate : new Date(data.appointmentDate);
    const now = new Date();
    return appointmentDate >= now;
  }
  return true;
}, {
  message: "Appointment date cannot be in the past",
  path: ["appointmentDate"]
});

const appointmentQuerySchema = z.object({
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  patientId: z.string().uuid("Patient ID must be a valid UUID").optional(),
  storeId: z.string().uuid("Store ID must be a valid UUID").optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"], {
    errorMap: () => ({ message: "Status must be one of: scheduled, confirmed, in_progress, completed, cancelled, no_show" })
  }).optional(),
  limit: z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num) || num < 1 || num > 1000) {
      throw new Error("Limit must be a number between 1 and 1000");
    }
    return num;
  }).optional(),
  recent: z.string().transform((val) => {
    if (val === "true" || val === "1") return true;
    if (val === "false" || val === "0") return false;
    throw new Error("Recent must be 'true', 'false', '1', or '0'");
  }).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"]
});

export function registerAppointmentRoutes(app: Express) {
  // POST /api/appointments/:id/complete - Complete appointment and trigger prescription workflow
  app.post("/api/appointments/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnosis, treatmentNotes, prescriptionRequired } = req.body;
      
      // Get the appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);
        
      if (appointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const appointmentData = appointment[0];
      
      // Update appointment status to completed
      await db
        .update(appointments)
        .set({
          status: 'completed',
          notes: treatmentNotes || appointmentData.notes,
          customFields: {
             ...(appointmentData.customFields || {}),
             diagnosis: diagnosis,
             treatmentNotes: treatmentNotes,
             completedAt: new Date().toISOString()
           },
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id));
      
      let prescriptionData = null;
      
      // Create prescription template if required
      if (prescriptionRequired) {
        try {
          prescriptionData = {
            appointmentId: id,
            patientId: appointmentData.patientId,
            doctorId: (req.user as any)?.id || (appointmentData.customFields as any)?.assignedDoctorId,
            storeId: appointmentData.storeId,
            prescriptionNumber: `RX-${Date.now()}-${id.slice(-8)}`,
            prescriptionDate: new Date(),
            prescriptionType: 'comprehensive',
            priority: 'normal',
            diagnosis: diagnosis || appointmentData.service || 'General consultation',
            instructions: 'Please complete prescription details',
            status: 'draft',
            isForwarded: false,
            forwardedModules: [],
            refillsAllowed: 0,
            digitalSignature: null,
            notes: `Generated from appointment: ${appointmentData.service}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // In a real implementation, you would create the prescription in the database
          // For now, we'll store the prescription template in appointment custom fields
          await db
            .update(appointments)
            .set({
              customFields: {
                 ...(appointmentData.customFields || {}),
                 diagnosis: diagnosis,
                 treatmentNotes: treatmentNotes,
                 completedAt: new Date().toISOString(),
                 prescriptionTemplate: {
                   created: true,
                   prescriptionNumber: prescriptionData.prescriptionNumber,
                   createdAt: new Date().toISOString(),
                   status: 'pending_completion',
                   data: prescriptionData
                 }
               }
            })
            .where(eq(appointments.id, id));
          
          console.log(`📋 PRESCRIPTION TEMPLATE CREATED: Appointment ${id} -> Prescription ${prescriptionData.prescriptionNumber}`);
          
        } catch (prescriptionError) {
          console.error("Error creating prescription template:", prescriptionError);
          // Don't fail the appointment completion if prescription creation fails
        }
      }
      
      res.json({
        message: "Appointment completed successfully",
        appointmentId: id,
        status: 'completed',
        prescriptionCreated: !!prescriptionData,
        prescriptionNumber: prescriptionData?.prescriptionNumber
      });
      
    } catch (error) {
      console.error("Error completing appointment:", error);
      res.status(500).json({ message: "Failed to complete appointment" });
    }
  });
  
  // POST /api/appointments/:id/create-prescription - Create prescription from appointment
  app.post("/api/appointments/:id/create-prescription", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnosis, prescriptionType, priority, instructions } = req.body;
      
      // Get the appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);
        
      if (appointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const appointmentData = appointment[0];
      
      // Check if appointment is completed or in progress
      if (!['completed', 'in_progress'].includes(appointmentData.status)) {
        return res.status(400).json({ 
          message: "Prescription can only be created for completed or in-progress appointments" 
        });
      }
      
      const prescriptionData = {
        appointmentId: id,
        patientId: appointmentData.patientId,
        doctorId: (req.user as any)?.id || (appointmentData.customFields as any)?.assignedDoctorId,
        storeId: appointmentData.storeId,
        prescriptionNumber: `RX-${Date.now()}-${id.slice(-8)}`,
        prescriptionDate: new Date(),
        prescriptionType: prescriptionType || 'comprehensive',
        priority: priority || 'normal',
        diagnosis: diagnosis || (appointmentData.customFields as any)?.diagnosis || appointmentData.service,
        instructions: instructions || 'Please complete prescription details',
        status: 'draft',
        isForwarded: false,
        forwardedModules: [],
        refillsAllowed: 0,
        digitalSignature: null,
        notes: `Generated from appointment: ${appointmentData.service}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store prescription template in appointment custom fields
      await db
        .update(appointments)
        .set({
          customFields: {
             ...(appointmentData.customFields || {}),
             prescriptionTemplate: {
               created: true,
               prescriptionNumber: prescriptionData.prescriptionNumber,
               createdAt: new Date().toISOString(),
               status: 'draft',
               data: prescriptionData
             }
           },
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id));
      
      console.log(`📋 PRESCRIPTION CREATED: Appointment ${id} -> Prescription ${prescriptionData.prescriptionNumber}`);
      
      res.json({
        message: "Prescription created successfully",
        appointmentId: id,
        prescriptionNumber: prescriptionData.prescriptionNumber,
        prescriptionData: prescriptionData
      });
      
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });
  
  // GET /api/appointments/:id/prescription - Get prescription associated with appointment
  app.get("/api/appointments/:id/prescription", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the appointment with prescription data
      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id))
        .limit(1);
        
      if (appointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const appointmentData = appointment[0];
      const prescriptionTemplate = (appointmentData.customFields as any)?.prescriptionTemplate;
      
      if (!prescriptionTemplate) {
        return res.status(404).json({ message: "No prescription found for this appointment" });
      }
      
      res.json({
        appointmentId: id,
        prescription: prescriptionTemplate
      });
      
    } catch (error) {
      console.error("Error getting appointment prescription:", error);
      res.status(500).json({ message: "Failed to get appointment prescription" });
    }
  });

  // Get all appointments with optional filters
  app.get("/api/medical-appointments", isAuthenticated, async (req, res) => {
    try {
      const query = appointmentQuerySchema.parse(req.query);
      
      let dbQuery = db.select({
        id: appointments.id,
        patientId: appointments.patientId,
        storeId: appointments.storeId,
        service: appointments.service,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        customFields: appointments.customFields,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        // Patient information
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        patientEmail: patients.email,
        patientPhone: patients.phone,
        // Store information
        storeName: stores.name,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(stores, eq(appointments.storeId, stores.id));

      // Apply filters
      const conditions = [];
      
      if (query.startDate) {
        conditions.push(gte(appointments.appointmentDate, new Date(query.startDate)));
      }
      
      if (query.endDate) {
        conditions.push(lte(appointments.appointmentDate, new Date(query.endDate)));
      }
      
      if (query.patientId) {
        conditions.push(eq(appointments.patientId, query.patientId));
      }
      
      if (query.storeId) {
        conditions.push(eq(appointments.storeId, query.storeId));
      }
      
      if (query.status) {
        conditions.push(eq(appointments.status, query.status));
      }

      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions)) as any;
      }

      // Apply ordering
      if (query.recent) {
        dbQuery = (dbQuery as any).orderBy(desc(appointments.createdAt));
      } else {
        dbQuery = (dbQuery as any).orderBy(appointments.appointmentDate);
      }

      // Apply limit
      if (query.limit) {
        dbQuery = (dbQuery as any).limit(query.limit);
      }

      const result = await dbQuery;
      
      // Transform the result to include full patient name
      const transformedResult = result.map(appointment => ({
        ...appointment,
        patientName: appointment.patientFirstName && appointment.patientLastName 
          ? `${appointment.patientFirstName} ${appointment.patientLastName}`
          : 'Unknown Patient',
      }));
      
      res.json(transformedResult);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid query parameters",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ 
        message: "Internal server error while fetching appointments",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get appointment by ID
  app.get("/api/medical-appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID format (UUID)
      if (!id || typeof id !== 'string' || id.length !== 36) {
        return res.status(400).json({ 
          message: "Invalid appointment ID format. Expected UUID."
        });
      }
      
      const [appointment] = await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          storeId: appointments.storeId,
          service: appointments.service,
          appointmentDate: appointments.appointmentDate,
          duration: appointments.duration,
          status: appointments.status,
          notes: appointments.notes,
          customFields: appointments.customFields,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
        })
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!appointment) {
        return res.status(404).json({ 
          message: "Appointment not found",
          appointmentId: id
        });
      }

      res.json(appointment);
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ 
        message: "Internal server error while fetching appointment",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Create new appointment
  app.post("/api/medical-appointments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Log appointment creation
      console.log('Creating appointment with data:', validatedData);
      
      // Create appointment with UUID
      const appointmentId = crypto.randomUUID();
      
      await db.insert(appointments).values({
        id: appointmentId,
        ...validatedData
      });
      
      // Fetch the complete appointment data with patient and store info
      const completeAppointment = await db.select({
        id: appointments.id,
        patientId: appointments.patientId,
        storeId: appointments.storeId,
        service: appointments.service,
        appointmentDate: appointments.appointmentDate,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        customFields: appointments.customFields,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        // Patient information
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        patientEmail: patients.email,
        patientPhone: patients.phone,
        // Store information
        storeName: stores.name,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .leftJoin(stores, eq(appointments.storeId, stores.id))
        .where(eq(appointments.id, appointmentId))
        .limit(1);
      
      if (!completeAppointment || completeAppointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found after creation" });
      }
      
      const appointmentData = completeAppointment[0];
      const transformedResult = {
        ...appointmentData,
        patientName: appointmentData.patientFirstName && appointmentData.patientLastName 
          ? `${appointmentData.patientFirstName} ${appointmentData.patientLastName}`
          : 'Unknown Patient'
      };
      
      res.status(201).json(transformedResult);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Handle database constraint errors
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: "Invalid reference: Patient or Store not found"
        });
      }
      
      if (error?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          message: "Appointment conflict: Duplicate entry detected"
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while creating appointment",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Update appointment
  app.patch("/api/medical-appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID format (UUID)
      if (!id || typeof id !== 'string' || id.length !== 36) {
        return res.status(400).json({ 
          message: "Invalid appointment ID format. Expected UUID."
        });
      }
      
      const validatedData = appointmentUpdateSchema.parse(req.body);

      await db
        .update(appointments)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id));

      const [updatedAppointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!updatedAppointment) {
        return res.status(404).json({ 
          message: "Appointment not found",
          appointmentId: id
        });
      }

      res.json(updatedAppointment);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Handle database constraint errors
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
          message: "Invalid reference: Patient or Store not found"
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while updating appointment",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Delete appointment
  app.delete("/api/medical-appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID format (UUID)
      if (!id || typeof id !== 'string' || id.length !== 36) {
        return res.status(400).json({ 
          message: "Invalid appointment ID format. Expected UUID."
        });
      }

      const [existingAppointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!existingAppointment) {
        return res.status(404).json({ 
          message: "Appointment not found",
          appointmentId: id
        });
      }

      await db
        .delete(appointments)
        .where(eq(appointments.id, id));

      res.json({ 
        message: "Appointment deleted successfully",
        appointmentId: id
      });
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ 
        message: "Internal server error while deleting appointment",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
}