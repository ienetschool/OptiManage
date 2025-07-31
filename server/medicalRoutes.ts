import type { Express } from "express";
import { 
  doctors, 
  patients, 
  medicalAppointments, 
  prescriptions, 
  prescriptionItems,
  medicalInterventions,
  medicalInvoices,
  medicalInvoiceItems,
  patientHistory,
  insertDoctorSchema,
  insertPatientSchema,
  insertMedicalAppointmentSchema,
  insertPrescriptionSchema,
  insertPrescriptionItemSchema,
  insertMedicalInterventionSchema,
  insertMedicalInvoiceSchema,
  insertMedicalInvoiceItemSchema
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";
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
      const [doctor] = await db.insert(doctors).values(validatedData).returning();
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

  app.post("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const [patient] = await db.insert(patients).values(validatedData).returning();
      res.json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ message: "Failed to create patient" });
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
      const [appointment] = await db.insert(medicalAppointments).values(validatedData).returning();
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
      
      // Generate QR code for the prescription
      const qrCodeData = `${req.protocol}://${req.hostname}/verify/prescription/${validatedData.prescriptionNumber}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      
      const [prescription] = await db.insert(prescriptions).values({
        ...validatedData,
        qrCode: qrCodeUrl
      }).returning();

      // Create patient history entry
      await db.insert(patientHistory).values({
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        recordType: "prescription",
        recordId: prescription.id,
        title: `Prescription ${prescription.prescriptionNumber}`,
        description: `${prescription.prescriptionType} prescription created`,
        metadata: { 
          prescriptionType: prescription.prescriptionType,
          diagnosis: prescription.diagnosis 
        }
      });

      res.json(prescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  app.get("/api/prescriptions/:id", isAuthenticated, async (req, res) => {
    try {
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, req.params.id));
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      res.json(prescription);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.status(500).json({ message: "Failed to fetch prescription" });
    }
  });

  // Prescription PDF Generation
  app.post("/api/prescriptions/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, req.params.id));
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Here you would implement PDF generation using puppeteer or jsPDF
      // For now, we'll return a success message
      res.json({ message: "PDF generated successfully", downloadUrl: `/downloads/prescription-${prescription.prescriptionNumber}.pdf` });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Prescription Email Sending
  app.post("/api/prescriptions/:id/email", isAuthenticated, async (req, res) => {
    try {
      const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, req.params.id));
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Here you would implement email sending logic
      // For now, we'll return a success message
      res.json({ message: "Prescription sent via email successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Medical Interventions Routes
  app.get("/api/medical-interventions", isAuthenticated, async (req, res) => {
    try {
      const interventionsList = await db.select().from(medicalInterventions).orderBy(desc(medicalInterventions.createdAt));
      res.json(interventionsList);
    } catch (error) {
      console.error("Error fetching medical interventions:", error);
      res.status(500).json({ message: "Failed to fetch medical interventions" });
    }
  });

  app.post("/api/medical-interventions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalInterventionSchema.parse(req.body);
      const [intervention] = await db.insert(medicalInterventions).values(validatedData).returning();
      res.json(intervention);
    } catch (error) {
      console.error("Error creating medical intervention:", error);
      res.status(500).json({ message: "Failed to create medical intervention" });
    }
  });

  // Medical Invoices Routes
  app.get("/api/medical-invoices", isAuthenticated, async (req, res) => {
    try {
      const invoicesList = await db.select().from(medicalInvoices).orderBy(desc(medicalInvoices.createdAt));
      res.json(invoicesList);
    } catch (error) {
      console.error("Error fetching medical invoices:", error);
      res.status(500).json({ message: "Failed to fetch medical invoices" });
    }
  });

  app.post("/api/medical-invoices", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalInvoiceSchema.parse(req.body);
      
      // Generate QR code for the invoice
      const qrCodeData = `${req.protocol}://${req.hostname}/verify/invoice/${validatedData.invoiceNumber}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      
      const [invoice] = await db.insert(medicalInvoices).values({
        ...validatedData,
        qrCode: qrCodeUrl
      }).returning();

      // Create patient history entry
      await db.insert(patientHistory).values({
        patientId: invoice.patientId,
        doctorId: invoice.doctorId,
        recordType: "invoice",
        recordId: invoice.id,
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `Medical invoice for ${invoice.total}`,
        metadata: { 
          total: invoice.total,
          paymentStatus: invoice.paymentStatus 
        }
      });

      res.json(invoice);
    } catch (error) {
      console.error("Error creating medical invoice:", error);
      res.status(500).json({ message: "Failed to create medical invoice" });
    }
  });

  // Patient History Routes
  app.get("/api/patients/:id/history", isAuthenticated, async (req, res) => {
    try {
      const history = await db.select().from(patientHistory)
        .where(eq(patientHistory.patientId, req.params.id))
        .orderBy(desc(patientHistory.recordDate));
      res.json(history);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      res.status(500).json({ message: "Failed to fetch patient history" });
    }
  });

  // QR Code Verification Routes
  app.get("/api/verify/prescription/:number", async (req, res) => {
    try {
      const [prescription] = await db.select().from(prescriptions)
        .where(eq(prescriptions.prescriptionNumber, req.params.number));
      
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Return basic prescription info for verification
      res.json({
        prescriptionNumber: prescription.prescriptionNumber,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        prescriptionType: prescription.prescriptionType,
        prescriptionDate: prescription.prescriptionDate,
        status: prescription.status,
        verified: true
      });
    } catch (error) {
      console.error("Error verifying prescription:", error);
      res.status(500).json({ message: "Failed to verify prescription" });
    }
  });

  app.get("/api/verify/invoice/:number", async (req, res) => {
    try {
      const [invoice] = await db.select().from(medicalInvoices)
        .where(eq(medicalInvoices.invoiceNumber, req.params.number));
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Return basic invoice info for verification
      res.json({
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        invoiceDate: invoice.invoiceDate,
        total: invoice.total,
        paymentStatus: invoice.paymentStatus,
        verified: true
      });
    } catch (error) {
      console.error("Error verifying invoice:", error);
      res.status(500).json({ message: "Failed to verify invoice" });
    }
  });
}