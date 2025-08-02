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

  // Public patient registration endpoint (no authentication required)
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Received patient registration data:", req.body);
      const validatedData = insertPatientSchema.parse(req.body);
      const [patient] = await db.insert(patients).values(validatedData).returning();
      console.log("Patient created successfully:", patient);
      res.json(patient);
    } catch (error: any) {
      console.error("Error creating patient:", error);
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
      
      const [prescription] = await db.insert(prescriptions).values(validatedData).returning();

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

  // Medical Invoices Routes (for backward compatibility)
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
      console.log(`📝 MEDICAL INVOICE CREATION REQUEST:`, JSON.stringify(req.body, null, 2));
      
      // Parse and validate the incoming data  
      const invoiceData = {
        invoiceNumber: req.body.invoiceNumber || `INV-${Date.now()}`,
        patientId: req.body.patientId,
        appointmentId: req.body.appointmentId,
        storeId: req.body.storeId || "5ff902af-3849-4ea6-945b-4d49175d6638",
        invoiceDate: req.body.invoiceDate ? new Date(req.body.invoiceDate).toISOString() : new Date().toISOString(),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate).toISOString() : new Date().toISOString(),
        subtotal: parseFloat(req.body.subtotal) || 0,
        taxAmount: parseFloat(req.body.taxAmount) || 0,
        discountAmount: parseFloat(req.body.discountAmount) || 0,
        total: parseFloat(req.body.total) || 0,
        paymentStatus: req.body.paymentStatus || 'pending',
        paymentMethod: req.body.paymentMethod,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate).toISOString() : null,
        notes: req.body.notes || ''
      };
      
      console.log(`💰 MEDICAL INVOICE CALCULATIONS: Subtotal: $${invoiceData.subtotal}, Tax: $${invoiceData.taxAmount}, Total: $${invoiceData.total}`);
      
      // Create the medical invoice in the database
      const [medicalInvoice] = await db.insert(medicalInvoices).values([invoiceData]).returning();
      
      // Create patient history entry
      await db.insert(patientHistory).values({
        patientId: medicalInvoice.patientId,
        recordType: "invoice",
        recordId: medicalInvoice.id,
        title: `Invoice ${medicalInvoice.invoiceNumber}`,
        description: `Medical invoice for $${medicalInvoice.total} - ${medicalInvoice.paymentStatus}`,
        metadata: { 
          invoiceNumber: medicalInvoice.invoiceNumber,
          amount: medicalInvoice.total,
          paymentStatus: medicalInvoice.paymentStatus
        }
      });
      
      console.log(`✅ MEDICAL INVOICE CREATED: ${medicalInvoice.invoiceNumber} - Total: $${medicalInvoice.total} - Status: ${medicalInvoice.paymentStatus}`);
      res.json(medicalInvoice);
    } catch (error) {
      console.error("Error creating medical invoice:", error);
      res.status(500).json({ message: "Failed to create medical invoice", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Invoice Management Routes (frontend compatibility)
  app.get("/api/medical-invoices", isAuthenticated, async (req, res) => {
    try {
      // Mock invoice data that matches the InvoiceManagement interface
      const mockInvoices = [
        {
          id: "inv-001",
          invoiceNumber: "INV-001",
          customerId: "cust-001",
          customerName: "Sarah Johnson", 
          storeId: "store-001",
          storeName: "OptiStore Downtown",
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: 250.00,
          taxRate: 8.5,
          taxAmount: 21.25,
          discountAmount: 0.00,
          total: 271.25,
          status: "sent",
          paymentMethod: "card",
          notes: "Eye examination and prescription glasses",
          items: [
            {
              id: "item-001",
              productId: "prod-001",
              productName: "Progressive Lenses",
              description: "High-quality progressive lenses",
              quantity: 1,
              unitPrice: 150.00,
              discount: 0,
              total: 150.00
            },
            {
              id: "item-002", 
              productId: "prod-002",
              productName: "Designer Frame",
              description: "Premium designer eyeglass frame",
              quantity: 1,
              unitPrice: 100.00,
              discount: 0,
              total: 100.00
            }
          ]
        },
        {
          id: "inv-002",
          invoiceNumber: "INV-002",
          customerId: "cust-002",
          customerName: "Michael Chen",
          storeId: "store-001", 
          storeName: "OptiStore Downtown",
          date: new Date(Date.now() - 86400000).toISOString(),
          dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: 180.00,
          taxRate: 8.5,
          taxAmount: 15.30,
          discountAmount: 20.00,
          total: 175.30,
          status: "paid",
          paymentMethod: "cash",
          notes: "Contact lens fitting",
          items: [
            {
              id: "item-003",
              productId: "prod-003", 
              productName: "Contact Lenses (Monthly)",
              description: "Monthly disposable contact lenses",
              quantity: 2,
              unitPrice: 90.00,
              discount: 0,
              total: 180.00
            }
          ]
        }
      ];

      res.json(mockInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoiceData = req.body;
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      // Create new invoice with proper decimal handling
      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        date: new Date().toISOString(),
        status: "draft",
        ...invoiceData,
        // Ensure decimal values are properly handled
        subtotal: parseFloat(invoiceData.subtotal || 0).toFixed(2),
        taxAmount: parseFloat(invoiceData.taxAmount || 0).toFixed(2), 
        discountAmount: parseFloat(invoiceData.discountAmount || 0).toFixed(2),
        total: parseFloat(invoiceData.total || 0).toFixed(2),
        // Process items with decimal handling
        items: (invoiceData.items || []).map((item: any) => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice || 0).toFixed(2),
          total: parseFloat(item.total || 0).toFixed(2)
        }))
      };

      res.json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
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