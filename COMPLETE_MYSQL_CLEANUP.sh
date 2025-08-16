#!/bin/bash
echo "🔧 COMPLETE MYSQL CLEANUP - Removing ALL PostgreSQL Code"
echo "======================================================"

# Create completely clean MySQL-compatible route files
echo "Creating clean MySQL-compatible medicalRoutes.ts..."
cat > server/medicalRoutes_CLEAN.ts << 'MEDICAL_EOF'
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
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("MySQL Patient Registration:", req.body);
      
      const patientCode = req.body.patientCode || `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const validationData = { ...req.body };
      delete validationData.patientCode;
      
      const modifiedSchema = insertPatientSchema.omit({ patientCode: true });
      const validatedData = modifiedSchema.parse(validationData);
      const finalData = { ...validatedData, patientCode };
      
      console.log("MySQL Insert Data:", finalData);
      
      // Pure MySQL insert - no PostgreSQL syntax
      await db.insert(patients).values(finalData);
      
      // MySQL select to get created patient
      const [patient] = await db.select().from(patients).where(eq(patients.patientCode, patientCode)).limit(1);
      
      console.log("MySQL Patient Created:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("MySQL Patient Error:", error);
      res.status(500).json({ message: "Failed to create patient", error: error?.message });
    }
  });

  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const patientsList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      res.json(patientsList);
    } catch (error) {
      console.error("MySQL Patients Fetch Error:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/medical-appointments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalAppointmentSchema.parse(req.body);
      
      // Pure MySQL insert
      await db.insert(medicalAppointments).values(validatedData);
      
      // MySQL select to get created appointment
      const [appointment] = await db.select().from(medicalAppointments).where(eq(medicalAppointments.appointmentNumber, validatedData.appointmentNumber)).limit(1);
      
      res.json(appointment);
    } catch (error) {
      console.error("MySQL Appointment Error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.post("/api/prescriptions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPrescriptionSchema.parse(req.body);
      
      // Pure MySQL insert
      await db.insert(prescriptions).values(validatedData);
      
      // MySQL select to get created prescription
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.prescriptionNumber, validatedData.prescriptionNumber)).limit(1);
      
      res.json(prescription);
    } catch (error) {
      console.error("MySQL Prescription Error:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });
}
MEDICAL_EOF

echo "✅ Created clean MySQL medicalRoutes.ts"
echo "📁 File ready for production deployment"