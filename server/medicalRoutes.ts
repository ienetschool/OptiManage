import type { Express } from "express";
import { 
  doctors, 
  patients, 
  medicalAppointments, 
  prescriptions,
  insertDoctorSchema,
  insertPatientSchema,
  insertMedicalAppointmentSchema,
  insertPrescriptionSchema
} from "@shared/mysql-schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "./oauthAuth";

export function registerMedicalRoutes(app: Express) {
  // Doctors Routes
  app.get("/api/doctors", isAuthenticated, async (req, res) => {
    try {
      const doctorsList = await db.select().from(doctors).orderBy(desc(doctors.createdAt));
      res.json(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.post("/api/doctors", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDoctorSchema.parse(req.body);
      await db.insert(doctors).values(validatedData);
      
      const [doctor] = await db.select().from(doctors).where(eq(doctors.doctorId, validatedData.doctorId)).limit(1);
      res.json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });

  // Patients Routes
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patientsList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      
      // Transform snake_case database fields to camelCase for frontend compatibility
      const transformedPatients = patientsList.map(patient => ({
        ...patient,
        firstName: patient.first_name || patient.firstName,
        lastName: patient.last_name || patient.lastName,
        patientCode: patient.patient_code || patient.patientCode,
        emergencyContactName: patient.emergency_contact_name || patient.emergencyContactName,
        emergencyContactPhone: patient.emergency_contact_phone || patient.emergencyContactPhone,
        emergencyContactRelation: patient.emergency_contact_relation || patient.emergencyContactRelation,
        dateOfBirth: patient.date_of_birth || patient.dateOfBirth,
        isActive: patient.is_active || patient.isActive
      }));
      
      res.json(transformedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Public patient registration endpoint (no authentication required)
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Received patient registration data:", req.body);
      
      // Auto-generate patient code if not provided
      const patientCode = req.body.patientCode || `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Prepare validation data with date conversion
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      // Convert date string to Date object if provided
      if (validationData.dateOfBirth && typeof validationData.dateOfBirth === 'string') {
        try {
          validationData.dateOfBirth = new Date(validationData.dateOfBirth);
        } catch {
          validationData.dateOfBirth = null;
        }
      }
      
      // Create schema without patientCode validation
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      
      // Validate input
      const validatedData = modifiedSchema.parse(validationData);
      
      // Add auto-generated patientCode
      const finalData = {
        ...validatedData,
        patientCode: patientCode
      };
      
      console.log("Final data for insertion:", finalData);
      
      // MySQL compatible insert
      await db.insert(patients).values(finalData);
      
      // Fetch created patient
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      
      console.log("Patient created successfully:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      
      if (error.issues) {
        return res.status(400).json({ 
          message: "Validation failed", 
          error: JSON.stringify(error.issues, null, 2)
        });
      }
      
      res.status(500).json({ message: "Failed to create patient", error: error?.message || "Unknown error" });
    }
  });

  // Patient UPDATE endpoint - CRITICAL MISSING FUNCTIONALITY
  app.put("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validationData = { ...req.body };
      
      // Handle date conversion for updates
      if (validationData.dateOfBirth && typeof validationData.dateOfBirth === 'string') {
        try {
          validationData.dateOfBirth = new Date(validationData.dateOfBirth);
        } catch {
          validationData.dateOfBirth = null;
        }
      }
      
      const validatedData = insertPatientSchema.partial().parse(validationData);
      
      await db.update(patients).set({
        ...validatedData,
        updatedAt: new Date()
      }).where(eq(patients.id, id));
      
      const [updatedPatient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
      res.json(updatedPatient);
    } catch (error: any) {
      console.error("Error updating patient:", error);
      res.status(500).json({ message: "Failed to update patient", error: error?.message });
    }
  });

  // Medical Appointments Routes
  app.get("/api/medical-appointments", isAuthenticated, async (req, res) => {
    try {
      const appointmentsList = await db.select().from(medicalAppointments).orderBy(desc(medicalAppointments.createdAt));
      res.json(appointmentsList);
    } catch (error) {
      console.error("Error fetching medical appointments:", error);
      res.status(500).json({ message: "Failed to fetch medical appointments" });
    }
  });

  app.post("/api/medical-appointments", isAuthenticated, async (req, res) => {
    try {
      const validationData = { ...req.body };
      
      // Handle date conversion for appointments
      if (validationData.appointmentDate && typeof validationData.appointmentDate === 'string') {
        validationData.appointmentDate = new Date(validationData.appointmentDate);
      }
      
      const validatedData = insertMedicalAppointmentSchema.parse(validationData);
      await db.insert(medicalAppointments).values(validatedData);
      
      const [appointment] = await db.select().from(medicalAppointments).where(eq(medicalAppointments.appointmentId, validatedData.appointmentId)).limit(1);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating medical appointment:", error);
      res.status(500).json({ message: "Failed to create medical appointment" });
    }
  });

  // Medical Appointment UPDATE endpoint
  app.put("/api/medical-appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validationData = { ...req.body };
      
      // Handle date conversion for updates
      if (validationData.appointmentDate && typeof validationData.appointmentDate === 'string') {
        validationData.appointmentDate = new Date(validationData.appointmentDate);
      }
      
      const validatedData = insertMedicalAppointmentSchema.partial().parse(validationData);
      
      await db.update(medicalAppointments).set({
        ...validatedData,
        updatedAt: new Date()
      }).where(eq(medicalAppointments.id, id));
      
      const [updatedAppointment] = await db.select().from(medicalAppointments).where(eq(medicalAppointments.id, id)).limit(1);
      res.json(updatedAppointment);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment", error: error?.message });
    }
  });

  // Prescriptions Routes
  app.get("/api/prescriptions", isAuthenticated, async (req, res) => {
    try {
      const prescriptionsList = await db.select().from(prescriptions).orderBy(desc(prescriptions.createdAt));
      res.json(prescriptionsList);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.post("/api/prescriptions", isAuthenticated, async (req, res) => {
    try {
      const validationData = { ...req.body };
      
      // Handle date conversion for prescriptions
      if (validationData.issueDate && typeof validationData.issueDate === 'string') {
        validationData.issueDate = new Date(validationData.issueDate);
      }
      if (validationData.nextFollowUp && typeof validationData.nextFollowUp === 'string') {
        validationData.nextFollowUp = new Date(validationData.nextFollowUp);
      }
      
      const validatedData = insertPrescriptionSchema.parse(validationData);
      await db.insert(prescriptions).values(validatedData);
      
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.prescriptionId, validatedData.prescriptionId)).limit(1);
      res.json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // Prescription UPDATE endpoint
  app.put("/api/prescriptions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validationData = { ...req.body };
      
      // Handle date conversion for updates
      if (validationData.issueDate && typeof validationData.issueDate === 'string') {
        validationData.issueDate = new Date(validationData.issueDate);
      }
      if (validationData.nextFollowUp && typeof validationData.nextFollowUp === 'string') {
        validationData.nextFollowUp = new Date(validationData.nextFollowUp);
      }
      
      const validatedData = insertPrescriptionSchema.partial().parse(validationData);
      
      await db.update(prescriptions).set({
        ...validatedData,
        updatedAt: new Date()
      }).where(eq(prescriptions.id, id));
      
      const [updatedPrescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id)).limit(1);
      res.json(updatedPrescription);
    } catch (error: any) {
      console.error("Error updating prescription:", error);
      res.status(500).json({ message: "Failed to update prescription", error: error?.message });
    }
  });

  // Doctor UPDATE endpoint
  app.put("/api/doctors/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validationData = insertDoctorSchema.partial().parse(req.body);
      
      await db.update(doctors).set({
        ...validationData,
        updatedAt: new Date()
      }).where(eq(doctors.id, id));
      
      const [updatedDoctor] = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
      res.json(updatedDoctor);
    } catch (error: any) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ message: "Failed to update doctor", error: error?.message });
    }
  });
}