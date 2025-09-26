import type { Express } from "express";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { db } from "../db";
import { prescriptions, prescriptionItems, prescriptionAuditLog, patients, doctors, medicalAppointments } from "../../shared/mysql-schema";
import { isAuthenticated } from "../simpleAuth";
import { z } from "zod";

// Role-based access control middleware
const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // For now, we'll use a simple role mapping based on email or ID
    // In a real system, this would come from the database
    let userRole = 'patient'; // default
    if (user.email?.includes('admin') || user.id === '45761289') {
      userRole = 'admin';
    } else if (user.email?.includes('doctor') || user.firstName === 'Doctor') {
      userRole = 'doctor';
    }
    
    user.role = userRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    next();
  };
};

// Enhanced prescription schema with all new fields
const insertPrescriptionSchema = z.object({
  prescriptionNumber: z.string().min(1),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  appointmentId: z.string().optional(),
  prescriptionDate: z.date(),
  validUntil: z.date().optional(),
  prescriptionType: z.enum(['medicines', 'eye_treatment', 'specs_lens', 'diet', 'surgery', 'other']).default('medicines'),
  diagnosis: z.string().optional(),
  instructions: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'expired']).default('active'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().optional(),
  digitalSignature: z.string().optional(),
  signedAt: z.date().optional(),
  isForwarded: z.boolean().default(false),
  forwardedModules: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

const insertPrescriptionItemSchema = z.object({
  prescriptionId: z.string().min(1),
  itemType: z.enum(['medicine', 'eye_treatment', 'specs_lens', 'diet_recommendation', 'surgery_recommendation', 'other_treatment']),
  
  // Medicine fields
  medicationName: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  quantity: z.number().optional(),
  refills: z.number().optional(),
  
  // Eye treatment fields
  treatmentType: z.string().optional(),
  treatmentName: z.string().optional(),
  
  // Specs & Lens fields
  eyeType: z.enum(['left', 'right', 'both']).optional(),
  spherical: z.number().optional(),
  cylindrical: z.number().optional(),
  axis: z.number().optional(),
  addition: z.number().optional(),
  lensType: z.string().optional(),
  frameType: z.string().optional(),
  
  // Diet recommendation fields
  dietType: z.string().optional(),
  dietInstructions: z.string().optional(),
  
  // Surgery recommendation fields
  surgeryType: z.string().optional(),
  urgency: z.enum(['immediate', 'scheduled', 'optional']).optional(),
  surgeonRecommendation: z.string().optional(),
  
  // General fields
  instructions: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  customFields: z.record(z.any()).optional(),
});

// Audit log function
async function logPrescriptionAction(
  prescriptionId: string,
  userId: string,
  userRole: string,
  action: string,
  actionDetails: any = {},
  req: any
) {
  try {
    await db.insert(prescriptionAuditLog).values({
      prescriptionId,
      userId,
      userRole,
      action,
      actionDetails,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
    });
  } catch (error) {
    console.error('Error logging prescription action:', error);
  }
}

export function registerPrescriptionRoutes(app: Express) {
  
  // GET /api/prescriptions - List prescriptions with role-based filtering
  app.get("/api/prescriptions", isAuthenticated, async (req, res) => {
    try {
      const { search, type, status, patientId, doctorId, startDate, endDate, page = 1, limit = 20 } = req.query;
      const user = (req as any).user;
      
      let query = db
        .select({
          prescription: prescriptions,
          patient: {
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            email: patients.email,
          },
          doctor: {
            id: doctors.id,
            firstName: doctors.firstName,
            lastName: doctors.lastName,
            specialization: doctors.specialization,
          },
        })
        .from(prescriptions)
        .leftJoin(patients, eq(prescriptions.patientId, patients.id))
        .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id));

      // Determine user role
      let userRole = 'patient';
      if (user.email?.includes('admin') || user.id === '45761289') {
        userRole = 'admin';
      } else if (user.email?.includes('doctor') || user.firstName === 'Doctor') {
        userRole = 'doctor';
      }
      user.role = userRole;

      // Role-based filtering
      let baseConditions = [];
      if (user.role === 'patient') {
        baseConditions.push(eq(prescriptions.patientId, user.id));
      } else if (user.role === 'doctor') {
        baseConditions.push(eq(prescriptions.doctorId, user.id));
      }
      // Admins can see all prescriptions

      // Apply filters
      const conditions = [...baseConditions];
      if (search) {
        conditions.push(
          or(
            like(prescriptions.prescriptionNumber, `%${search}%`),
            like(patients.firstName, `%${search}%`),
            like(patients.lastName, `%${search}%`),
            like(prescriptions.diagnosis, `%${search}%`)
          )
        );
      }
      if (type) conditions.push(eq(prescriptions.prescriptionType, type as string));
      if (status) conditions.push(eq(prescriptions.status, status as string));
      if (patientId) conditions.push(eq(prescriptions.patientId, patientId as string));
      if (doctorId) conditions.push(eq(prescriptions.doctorId, doctorId as string));
      if (startDate) conditions.push(sql`${prescriptions.prescriptionDate} >= ${startDate}`);
      if (endDate) conditions.push(sql`${prescriptions.prescriptionDate} <= ${endDate}`);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const offset = (Number(page) - 1) * Number(limit);
      const results = await query
        .orderBy(desc(prescriptions.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Log view action for audit
      await logPrescriptionAction('', user.id, user.role, 'viewed_list', { filters: req.query }, req);

      res.json(results);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  // GET /api/prescriptions/:id - Get single prescription with items
  app.get("/api/prescriptions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const [prescription] = await db
        .select({
          prescription: prescriptions,
          patient: {
            id: patients.id,
            firstName: patients.firstName,
            lastName: patients.lastName,
            email: patients.email,
            phone: patients.phone,
          },
          doctor: {
            id: doctors.id,
            firstName: doctors.firstName,
            lastName: doctors.lastName,
            specialization: doctors.specialization,
            licenseNumber: doctors.licenseNumber,
          },
        })
        .from(prescriptions)
        .leftJoin(patients, eq(prescriptions.patientId, patients.id))
        .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Determine user role
      let userRole = 'patient';
      if (user.email?.includes('admin') || user.id === '45761289') {
        userRole = 'admin';
      } else if (user.email?.includes('doctor') || user.firstName === 'Doctor') {
        userRole = 'doctor';
      }
      user.role = userRole;

      // Role-based access control
      if (user.role === 'patient' && prescription.prescription.patientId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === 'doctor' && prescription.prescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get prescription items
      const items = await db
        .select()
        .from(prescriptionItems)
        .where(eq(prescriptionItems.prescriptionId, id));

      // Log view action
      await logPrescriptionAction(id, user.id, user.role, 'viewed', {}, req);

      res.json({ ...prescription, items });
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.status(500).json({ message: "Failed to fetch prescription" });
    }
  });

  // POST /api/prescriptions - Create prescription (doctors only)
  app.post("/api/prescriptions", isAuthenticated, requireRole(['doctor']), async (req, res) => {
    try {
      const user = (req as any).user;
      const validationData = { ...req.body };
      
      // Handle date conversion
      if (validationData.prescriptionDate && typeof validationData.prescriptionDate === 'string') {
        validationData.prescriptionDate = new Date(validationData.prescriptionDate);
      }
      if (validationData.validUntil && typeof validationData.validUntil === 'string') {
        validationData.validUntil = new Date(validationData.validUntil);
      }
      if (validationData.signedAt && typeof validationData.signedAt === 'string') {
        validationData.signedAt = new Date(validationData.signedAt);
      }
      
      // Ensure doctor can only create prescriptions for themselves
      validationData.doctorId = user.id;
      
      const validatedData = insertPrescriptionSchema.parse(validationData);
      
      // Generate prescription number if not provided
      if (!validatedData.prescriptionNumber) {
        const timestamp = Date.now();
        validatedData.prescriptionNumber = `RX-${timestamp}`;
      }
      
      await db.insert(prescriptions).values(validatedData);
      
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.prescriptionNumber, validatedData.prescriptionNumber))
        .limit(1);

      // Log creation
      await logPrescriptionAction(prescription.id, user.id, user.role, 'created', validatedData, req);
      
      res.status(201).json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // PUT /api/prescriptions/:id - Update prescription (doctors only)
  app.put("/api/prescriptions/:id", isAuthenticated, requireRole(['doctor']), async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const validationData = { ...req.body };
      
      // Check if prescription exists and belongs to doctor
      const [existingPrescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!existingPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      if (existingPrescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Handle date conversion
      if (validationData.prescriptionDate && typeof validationData.prescriptionDate === 'string') {
        validationData.prescriptionDate = new Date(validationData.prescriptionDate);
      }
      if (validationData.validUntil && typeof validationData.validUntil === 'string') {
        validationData.validUntil = new Date(validationData.validUntil);
      }
      if (validationData.signedAt && typeof validationData.signedAt === 'string') {
        validationData.signedAt = new Date(validationData.signedAt);
      }
      
      const validatedData = insertPrescriptionSchema.partial().parse(validationData);
      
      await db.update(prescriptions).set({
        ...validatedData,
        updatedAt: new Date()
      }).where(eq(prescriptions.id, id));
      
      const [updatedPrescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      // Log update
      await logPrescriptionAction(id, user.id, user.role, 'updated', validatedData, req);
      
      res.json(updatedPrescription);
    } catch (error) {
      console.error("Error updating prescription:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update prescription" });
    }
  });

  // POST /api/prescriptions/:id/items - Add prescription item (doctors only)
  app.post("/api/prescriptions/:id/items", isAuthenticated, requireRole(['doctor']), async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      
      // Check if prescription exists and belongs to doctor
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      if (prescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validationData = { ...req.body, prescriptionId: id };
      const validatedData = insertPrescriptionItemSchema.parse(validationData);
      
      // Remove undefined fields to avoid Drizzle validation issues
      const cleanedData = Object.fromEntries(
        Object.entries(validatedData).filter(([_, value]) => value !== undefined)
      );
      
      await db.insert(prescriptionItems).values(cleanedData);
      
      const [item] = await db
        .select()
        .from(prescriptionItems)
        .where(and(
          eq(prescriptionItems.prescriptionId, id),
          eq(prescriptionItems.itemType, validatedData.itemType)
        ))
        .orderBy(desc(prescriptionItems.createdAt))
        .limit(1);

      // Log item addition
      await logPrescriptionAction(id, user.id, user.role, 'item_added', validatedData, req);
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding prescription item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add prescription item" });
    }
  });

  // GET /api/prescriptions/:id/items - Get prescription items
  app.get("/api/prescriptions/:id/items", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      
      // Check access permissions
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Determine user role
      let userRole = 'patient';
      if (user.email?.includes('admin') || user.id === '45761289') {
        userRole = 'admin';
      } else if (user.email?.includes('doctor') || user.firstName === 'Doctor') {
        userRole = 'doctor';
      }
      user.role = userRole;

      // Role-based access control
      if (user.role === 'patient' && prescription.patientId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (user.role === 'doctor' && prescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const items = await db
        .select()
        .from(prescriptionItems)
        .where(eq(prescriptionItems.prescriptionId, id))
        .orderBy(desc(prescriptionItems.createdAt));
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching prescription items:", error);
      res.status(500).json({ message: "Failed to fetch prescription items" });
    }
  });

  // POST /api/prescriptions/:id/sign - Sign prescription (doctors only)
  app.post("/api/prescriptions/:id/sign", isAuthenticated, requireRole(['doctor']), async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { digitalSignature } = req.body;
      
      // Check if prescription exists and belongs to doctor
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      if (prescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await db.update(prescriptions).set({
        digitalSignature,
        signedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(prescriptions.id, id));

      // Log signing
      await logPrescriptionAction(id, user.id, user.role, 'signed', { digitalSignature: 'present' }, req);
      
      res.json({ message: "Prescription signed successfully" });
    } catch (error) {
      console.error("Error signing prescription:", error);
      res.status(500).json({ message: "Failed to sign prescription" });
    }
  });

  // GET /api/prescriptions/:id/audit - Get audit log (admins only)
  app.get("/api/prescriptions/:id/audit", isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      const auditLogs = await db
        .select()
        .from(prescriptionAuditLog)
        .where(eq(prescriptionAuditLog.prescriptionId, id))
        .orderBy(desc(prescriptionAuditLog.timestamp));
      
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // POST /api/prescriptions/:id/forward - Forward to other modules (doctors only)
  app.post("/api/prescriptions/:id/forward", isAuthenticated, requireRole(['doctor']), async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { modules } = req.body; // Array of module names to forward to
      
      // Check if prescription exists and belongs to doctor
      const [prescription] = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      if (prescription.doctorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update forwarding status
      await db.update(prescriptions).set({
        isForwarded: true,
        forwardedModules: modules,
        updatedAt: new Date()
      }).where(eq(prescriptions.id, id));

      // Log forwarding
      await logPrescriptionAction(id, user.id, user.role, 'forwarded', { modules }, req);
      
      // Here you would implement actual forwarding logic to other modules
      // For now, we'll just return success
      
      res.json({ message: "Prescription forwarded successfully", modules });
    } catch (error) {
      console.error("Error forwarding prescription:", error);
      res.status(500).json({ message: "Failed to forward prescription" });
    }
  });

  // GET /api/patients/:patientId/prescriptions - Get patient's prescription history
  app.get("/api/patients/:patientId/prescriptions", isAuthenticated, async (req, res) => {
    try {
      const { patientId } = req.params;
      const user = (req as any).user;
      const { type, startDate, endDate } = req.query;
      
      // Determine user role
      let userRole = 'patient';
      if (user.email?.includes('admin') || user.id === '45761289') {
        userRole = 'admin';
      } else if (user.email?.includes('doctor') || user.firstName === 'Doctor') {
        userRole = 'doctor';
      }
      user.role = userRole;

      // Role-based access control
      if (user.role === 'patient' && user.id !== patientId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      let query = db
        .select({
          prescription: prescriptions,
          doctor: {
            firstName: doctors.firstName,
            lastName: doctors.lastName,
            specialization: doctors.specialization,
          },
        })
        .from(prescriptions)
        .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
        .where(eq(prescriptions.patientId, patientId));

      // Apply filters
      const conditions = [eq(prescriptions.patientId, patientId)];
      if (type) conditions.push(eq(prescriptions.prescriptionType, type as string));
      if (startDate) conditions.push(sql`${prescriptions.prescriptionDate} >= ${startDate}`);
      if (endDate) conditions.push(sql`${prescriptions.prescriptionDate} <= ${endDate}`);

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      const results = await query.orderBy(desc(prescriptions.prescriptionDate));
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch patient prescriptions" });
    }
  });

  // GET /api/prescriptions/reports - Generate prescription reports (admins only)
  app.get("/api/prescriptions/reports", isAuthenticated, requireRole(['admin']), async (req, res) => {
    try {
      const { startDate, endDate, doctorId, type, groupBy = 'date' } = req.query;
      
      let query = db
        .select({
          prescription: prescriptions,
          patient: {
            firstName: patients.firstName,
            lastName: patients.lastName,
          },
          doctor: {
            firstName: doctors.firstName,
            lastName: doctors.lastName,
            specialization: doctors.specialization,
          },
        })
        .from(prescriptions)
        .leftJoin(patients, eq(prescriptions.patientId, patients.id))
        .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id));

      // Apply filters
      const conditions = [];
      if (startDate) conditions.push(sql`${prescriptions.prescriptionDate} >= ${startDate}`);
      if (endDate) conditions.push(sql`${prescriptions.prescriptionDate} <= ${endDate}`);
      if (doctorId) conditions.push(eq(prescriptions.doctorId, doctorId as string));
      if (type) conditions.push(eq(prescriptions.prescriptionType, type as string));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query.orderBy(desc(prescriptions.prescriptionDate));
      
      // Generate summary statistics
      const summary = {
        total: results.length,
        byType: results.reduce((acc, r) => {
          acc[r.prescription.prescriptionType] = (acc[r.prescription.prescriptionType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: results.reduce((acc, r) => {
          acc[r.prescription.status] = (acc[r.prescription.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byDoctor: results.reduce((acc, r) => {
          const doctorName = `${r.doctor?.firstName || ''} ${r.doctor?.lastName || ''}`.trim();
          acc[doctorName] = (acc[doctorName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      res.json({ prescriptions: results, summary });
    } catch (error) {
      console.error("Error generating prescription reports:", error);
      res.status(500).json({ message: "Failed to generate prescription reports" });
    }
  });

  // Integration endpoints for forwarding prescription data to other modules
  
  // POST /api/prescriptions/:id/forward - Forward prescription to specific modules
  app.post("/api/prescriptions/:id/forward", isAuthenticated, requireRole(['doctor', 'admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { modules, notes } = req.body;
      
      if (!modules || !Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ message: "At least one module must be specified" });
      }
      
      const validModules = ['pharmacy', 'optical', 'surgery', 'diet', 'treatment'];
      const invalidModules = modules.filter(m => !validModules.includes(m));
      if (invalidModules.length > 0) {
        return res.status(400).json({ message: `Invalid modules: ${invalidModules.join(', ')}` });
      }
      
      // Get prescription with items
      const prescription = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);
        
      if (prescription.length === 0) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      const prescriptionItems = await db
        .select()
        .from(prescriptionItems)
        .where(eq(prescriptionItems.prescriptionId, id));
      
      // Update prescription with forwarded modules
      const currentForwardedModules = prescription[0].forwardedModules || [];
      const updatedModules = [...new Set([...currentForwardedModules, ...modules])];
      
      await db
        .update(prescriptions)
        .set({
          isForwarded: true,
          forwardedModules: updatedModules,
          updatedAt: new Date(),
        })
        .where(eq(prescriptions.id, id));
      
      // Log the forwarding action
      await logPrescriptionAction(
        id,
        req.user.id,
        req.user.role,
        'forwarded',
        { modules, notes },
        req
      );
      
      // Prepare data for each module
      const forwardingResults = [];
      
      for (const module of modules) {
        try {
          let moduleData = {
            prescriptionId: id,
            prescriptionNumber: prescription[0].prescriptionNumber,
            patientId: prescription[0].patientId,
            doctorId: prescription[0].doctorId,
            prescriptionDate: prescription[0].prescriptionDate,
            diagnosis: prescription[0].diagnosis,
            instructions: prescription[0].instructions,
            priority: prescription[0].priority,
            notes: notes || prescription[0].notes,
            forwardedAt: new Date(),
            items: []
          };
          
          // Filter items relevant to each module
          switch (module) {
            case 'pharmacy':
              moduleData.items = prescriptionItems.filter(item => item.itemType === 'medicine');
              break;
            case 'optical':
              moduleData.items = prescriptionItems.filter(item => item.itemType === 'specs_lens');
              break;
            case 'surgery':
              moduleData.items = prescriptionItems.filter(item => item.itemType === 'surgery_recommendation');
              break;
            case 'diet':
              moduleData.items = prescriptionItems.filter(item => item.itemType === 'diet_recommendation');
              break;
            case 'treatment':
              moduleData.items = prescriptionItems.filter(item => item.itemType === 'eye_treatment' || item.itemType === 'other_treatment');
              break;
          }
          
          // In a real implementation, you would make HTTP requests to other services
          // For now, we'll simulate the forwarding
          forwardingResults.push({
            module,
            status: 'success',
            itemCount: moduleData.items.length,
            data: moduleData
          });
          
        } catch (moduleError) {
          console.error(`Error forwarding to ${module}:`, moduleError);
          forwardingResults.push({
            module,
            status: 'error',
            error: moduleError.message
          });
        }
      }
      
      res.json({
        message: "Prescription forwarded successfully",
        prescriptionId: id,
        forwardedModules: modules,
        results: forwardingResults
      });
      
    } catch (error) {
      console.error("Error forwarding prescription:", error);
      res.status(500).json({ message: "Failed to forward prescription" });
    }
  });
  
  // GET /api/prescriptions/:id/forwarding-status - Get forwarding status
  app.get("/api/prescriptions/:id/forwarding-status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      const prescription = await db
        .select({
          id: prescriptions.id,
          prescriptionNumber: prescriptions.prescriptionNumber,
          isForwarded: prescriptions.isForwarded,
          forwardedModules: prescriptions.forwardedModules,
          updatedAt: prescriptions.updatedAt
        })
        .from(prescriptions)
        .where(eq(prescriptions.id, id))
        .limit(1);
        
      if (prescription.length === 0) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Get forwarding audit logs
      const auditLogs = await db
        .select()
        .from(prescriptionAuditLog)
        .where(and(
          eq(prescriptionAuditLog.prescriptionId, id),
          eq(prescriptionAuditLog.action, 'forwarded')
        ))
        .orderBy(desc(prescriptionAuditLog.createdAt));
      
      res.json({
        prescription: prescription[0],
        forwardingHistory: auditLogs
      });
      
    } catch (error) {
      console.error("Error getting forwarding status:", error);
      res.status(500).json({ message: "Failed to get forwarding status" });
    }
  });
  
  // POST /api/prescriptions/bulk-forward - Bulk forward multiple prescriptions
  app.post("/api/prescriptions/bulk-forward", isAuthenticated, requireRole(['doctor', 'admin']), async (req, res) => {
    try {
      const { prescriptionIds, modules, notes } = req.body;
      
      if (!prescriptionIds || !Array.isArray(prescriptionIds) || prescriptionIds.length === 0) {
        return res.status(400).json({ message: "At least one prescription ID must be provided" });
      }
      
      if (!modules || !Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ message: "At least one module must be specified" });
      }
      
      const validModules = ['pharmacy', 'optical', 'surgery', 'diet', 'treatment'];
      const invalidModules = modules.filter(m => !validModules.includes(m));
      if (invalidModules.length > 0) {
        return res.status(400).json({ message: `Invalid modules: ${invalidModules.join(', ')}` });
      }
      
      const results = [];
      
      for (const prescriptionId of prescriptionIds) {
        try {
          // Get prescription
          const prescription = await db
            .select()
            .from(prescriptions)
            .where(eq(prescriptions.id, prescriptionId))
            .limit(1);
            
          if (prescription.length === 0) {
            results.push({
              prescriptionId,
              status: 'error',
              error: 'Prescription not found'
            });
            continue;
          }
          
          // Update prescription
          const currentForwardedModules = prescription[0].forwardedModules || [];
          const updatedModules = [...new Set([...currentForwardedModules, ...modules])];
          
          await db
            .update(prescriptions)
            .set({
              isForwarded: true,
              forwardedModules: updatedModules,
              updatedAt: new Date(),
            })
            .where(eq(prescriptions.id, prescriptionId));
          
          // Log the action
          await logPrescriptionAction(
            prescriptionId,
            req.user.id,
            req.user.role,
            'bulk_forwarded',
            { modules, notes },
            req
          );
          
          results.push({
            prescriptionId,
            status: 'success',
            forwardedModules: modules
          });
          
        } catch (error) {
          console.error(`Error forwarding prescription ${prescriptionId}:`, error);
          results.push({
            prescriptionId,
            status: 'error',
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      res.json({
        message: `Bulk forwarding completed: ${successCount} successful, ${errorCount} failed`,
        results,
        summary: {
          total: prescriptionIds.length,
          successful: successCount,
          failed: errorCount
        }
      });
      
    } catch (error) {
      console.error("Error in bulk forwarding:", error);
      res.status(500).json({ message: "Failed to perform bulk forwarding" });
    }
  });
  
  // GET /api/prescriptions/integration/modules - Get available integration modules
  app.get("/api/prescriptions/integration/modules", isAuthenticated, async (req, res) => {
    try {
      const modules = [
        {
          id: 'pharmacy',
          name: 'Pharmacy Module',
          description: 'Forward medicine prescriptions to pharmacy for dispensing',
          supportedItemTypes: ['medicine'],
          status: 'active'
        },
        {
          id: 'optical',
          name: 'Optical Module',
          description: 'Forward optical prescriptions for lens and frame preparation',
          supportedItemTypes: ['specs_lens'],
          status: 'active'
        },
        {
          id: 'surgery',
          name: 'Surgery Module',
          description: 'Forward surgery recommendations to surgical department',
          supportedItemTypes: ['surgery_recommendation'],
          status: 'active'
        },
        {
          id: 'diet',
          name: 'Diet & Nutrition Module',
          description: 'Forward diet recommendations to nutrition department',
          supportedItemTypes: ['diet_recommendation'],
          status: 'active'
        },
        {
          id: 'treatment',
          name: 'Treatment Module',
          description: 'Forward treatment recommendations to therapy department',
          supportedItemTypes: ['eye_treatment', 'other_treatment'],
          status: 'active'
        }
      ];
      
      res.json({ modules });
      
    } catch (error) {
      console.error("Error getting integration modules:", error);
      res.status(500).json({ message: "Failed to get integration modules" });
    }
  });
}