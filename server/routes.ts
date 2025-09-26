import { Express } from "express";
import { storage } from "./storage";
import { setupOAuthAuth } from "./oauthAuth";
import { registerAppointmentRoutes } from "./routes/appointmentRoutes";
import { registerMedicalRoutes } from "./medicalRoutes";
import { registerPrescriptionRoutes } from "./routes/prescriptionRoutes";
import { registerCouponRoutes } from "./routes/couponRoutes";
import { registerHRRoutes } from "./hrRoutes";
import { checkDatabaseHealth } from "./db";
import { registerInstallRoutes } from "./installRoutes";
import { registerSpecsWorkflowRoutes } from "./routes/specsWorkflowRoutes";
import { registerDashboardRoutes } from "./routes/dashboardRoutes";
import { z } from "zod";
import { insertStoreSchema } from "@shared/mysql-schema";

export function registerRoutes(app: Express) {
  // Setup OAuth authentication
  setupOAuthAuth(app);
  
  // Register installation/setup routes (DB test, import backup, etc.)
  registerInstallRoutes(app);
  
  // Register medical routes (patients, doctors, medical appointments)
  registerMedicalRoutes(app);
  
  // Register prescription routes (enhanced prescription management)
  registerPrescriptionRoutes(app);
  
  // Register appointment routes (legacy/general)
  registerAppointmentRoutes(app);
  
  // Register coupon routes for real-time validation
  registerCouponRoutes(app);
  
  // Register specs workflow routes (lens prescriptions, orders, cutting tasks, deliveries)
  registerSpecsWorkflowRoutes(app);
  
  // Register dashboard routes (stats and widgets)
  registerDashboardRoutes(app);
  
  // Register HR routes (staff, attendance, payroll)
  registerHRRoutes(app);
  
  // Basic health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Database health check
  app.get("/api/db-health", async (req, res) => {
    const health = await checkDatabaseHealth();
    if (health.healthy) {
      res.json(health);
    } else {
      res.status(500).json(health);
    }
  });

  // Legacy appointment routes - redirect to new medical-appointments endpoint
  app.get("/api/appointments", (req, res) => {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const redirectUrl = `/api/medical-appointments${queryString ? '?' + queryString : ''}`;
    res.redirect(301, redirectUrl);
  });

  app.get("/api/appointments/:id", (req, res) => {
    res.redirect(301, `/api/medical-appointments/${req.params.id}`);
  });

  app.post("/api/appointments", (req, res) => {
    res.redirect(307, "/api/medical-appointments");
  });

  app.patch("/api/appointments/:id", (req, res) => {
    res.redirect(307, `/api/medical-appointments/${req.params.id}`);
  });

  app.delete("/api/appointments/:id", (req, res) => {
    res.redirect(307, `/api/medical-appointments/${req.params.id}`);
  });

  // Legacy customers route - redirect to patients
  app.get("/api/customers", (req, res) => {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const redirectUrl = `/api/patients${queryString ? '?' + queryString : ''}`;
    res.redirect(301, redirectUrl);
  });
  
  // Get stores
   app.get("/api/stores", async (req, res) => {
     try {
       const stores = await storage.getStores();
       res.json(stores);
     } catch (error) {
       console.error("Error fetching stores:", error);
       res.status(500).json({ message: "Failed to fetch stores" });
     }
   });

  // Create store
  app.post("/api/stores", async (req, res) => {
    try {
      const data = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(data);
      res.status(201).json(store);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid store data",
          errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
        });
      }
      console.error("Error creating store:", error);
      res.status(500).json({ message: "Failed to create store" });
    }
  });
  
  // Note: /api/patients route is now handled by medicalRoutes.ts
   
   // Get products
   app.get("/api/products", async (req, res) => {
     try {
       const products = await storage.getProducts();
       res.json(products);
     } catch (error) {
       console.error("Error fetching products:", error);
       res.status(500).json({ message: "Failed to fetch products" });
     }
   });
  
  // Get invoices
   app.get("/api/invoices", async (req, res) => {
     try {
       const invoices = await storage.getInvoices();
       res.json(invoices);
     } catch (error) {
       console.error("Error fetching invoices:", error);
       res.status(500).json({ message: "Failed to fetch invoices" });
     }
   });

  // Create medical invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      console.log('📝 Creating medical invoice:', req.body);
      
      const { patientId, appointmentId, items, subtotal, tax, total, paymentMethod = 'pending', paymentStatus = 'pending', notes } = req.body;
      
      const invoiceData = {
        patientId,
        appointmentId,
        totalAmount: parseFloat(total || '0'),
        paymentMethod,
        paymentStatus,
        items: items || [],
        notes
      };

      const invoice = await storage.createMedicalInvoice(invoiceData);
      
      console.log('✅ Medical invoice created:', invoice.invoiceNumber);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Get sales
   app.get("/api/sales", async (req, res) => {
     try {
       const sales = await storage.getSales();
       res.json(sales);
     } catch (error) {
       console.error("Error fetching sales:", error);
       res.status(500).json({ message: "Failed to fetch sales" });
     }
   });
  
  // Get inventory
    app.get("/api/inventory", async (req, res) => {
      try {
        const inventory = await storage.getStoreInventory();
        res.json(inventory);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Failed to fetch inventory" });
      }
    });
}
