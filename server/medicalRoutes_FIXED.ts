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
import { eq, desc, and, like, gte, lte } from "drizzle-orm";
import { isAuthenticated } from "./oauthAuth";
import QRCode from "qrcode";

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
      
      // MySQL compatible insert
      await db.insert(doctors).values(validatedData);
      
      // Fetch the created doctor
      const [doctor] = await db.select().from(doctors).where(eq(doctors.licenseNumber, validatedData.licenseNumber)).limit(1);
      
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
      res.json(patientsList);
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
      
      // Remove patientCode from validation data completely and validate without it
      const validationData = { ...req.body };
      delete validationData.patientCode; // Remove it completely from validation
      
      // Create a schema without patientCode validation
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      
      // Validate input without patientCode
      const validatedData = modifiedSchema.parse(validationData);
      
      // Add the auto-generated patientCode to the validated data
      const finalData = {
        ...validatedData,
        patientCode: patientCode
      };
      
      console.log("Final data for insertion:", finalData);
      
      // MySQL compatible insert
      await db.insert(patients).values(finalData);
      
      // Fetch the created patient
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      
      console.log("Patient created successfully:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
      
      // Handle validation errors
      if (error.issues) {
        return res.status(400).json({ 
          message: "Validation failed", 
          error: JSON.stringify(error.issues, null, 2)
        });
      }
      
      res.status(500).json({ message: "Failed to create patient", error: error?.message || "Unknown error" });
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
      const validatedData = insertMedicalAppointmentSchema.parse(req.body);
      
      // MySQL compatible insert
      await db.insert(medicalAppointments).values(validatedData);
      
      // Fetch the created appointment
      const [appointment] = await db.select().from(medicalAppointments).where(eq(medicalAppointments.appointmentNumber, validatedData.appointmentNumber)).limit(1);
      
      res.json(appointment);
    } catch (error) {
      console.error("Error creating medical appointment:", error);
      res.status(500).json({ message: "Failed to create medical appointment" });
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
      const validatedData = insertPrescriptionSchema.parse(req.body);
      
      // MySQL compatible insert
      await db.insert(prescriptions).values(validatedData);
      
      // Fetch the created prescription
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.prescriptionNumber, validatedData.prescriptionNumber)).limit(1);
      
      res.json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  // Patient Search Endpoint
  app.get("/api/patients/search", isAuthenticated, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const searchResults = await db.select().from(patients)
        .where(
          and(
            eq(patients.isActive, true),
            like(patients.firstName, `%${q}%`)
          )
        )
        .limit(10);
      
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching patients:", error);
      res.status(500).json({ message: "Failed to search patients" });
    }
  });

  // Generate Patient QR Code
  app.get("/api/patients/:id/qr", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const qrData = {
        patientId: patient.id,
        patientCode: patient.patientCode,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone
      };
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      res.json({ qrCode });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });
}