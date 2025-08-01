import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupOAuthAuth, isAuthenticated } from "./oauthAuth";
import { registerAppointmentRoutes } from "./routes/appointmentRoutes";
import { registerMedicalRoutes } from "./medicalRoutes";
import { registerHRRoutes } from "./hrRoutes";
import { registerDashboardRoutes } from "./routes/dashboardRoutes";
import { registerProfileRoutes } from "./routes/profileRoutes";
import { registerMedicalRecordsRoutes } from "./routes/medicalRoutes";
import { registerPaymentRoutes } from "./routes/paymentRoutes";
import { registerStoreSettingsRoutes } from "./routes/storeSettingsRoutes";
import { registerAnalyticsRoutes } from "./routes/analyticsRoutes";
import { 
  insertStoreSchema,
  insertProductSchema,
  insertCustomerSchema,
  insertAppointmentSchema,
  insertSaleSchema,
  insertCategorySchema,
  insertSupplierSchema,
  doctors,
  staff
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { addTestRoutes } from "./testAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupOAuthAuth(app);
  
  // Add test routes for debugging
  addTestRoutes(app);

  // Register appointment routes (commenting out to avoid conflicts)
  // registerAppointmentRoutes(app);
  
  // Register dashboard routes
  registerDashboardRoutes(app);
  
  // Register profile routes
  registerProfileRoutes(app);
  
  // Register medical records routes
  registerMedicalRecordsRoutes(app);
  
  // Register payment routes
  registerPaymentRoutes(app);
  
  // Register store settings routes
  registerStoreSettingsRoutes(app);
  
  // Register analytics routes
  registerAnalyticsRoutes(app);
  
  // Register medical routes (includes patients, doctors, prescriptions)
  registerMedicalRoutes(app);
  
  // Register HR routes
  registerHRRoutes(app);
  
  // Database backup download endpoint
  app.get('/api/download/database-backup', (req, res) => {
    const backupFile = 'database_backup_complete.sql';
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), backupFile);
    
    if (fs.existsSync(filePath)) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const downloadName = `optistore_backup_${timestamp}.sql`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Cache-Control', 'no-cache');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Backup file not found' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        // Create a default user if not exists
        const defaultUser = {
          id: userId,
          email: req.user.claims.email || "admin@optistorepro.com",
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: "/api/placeholder/40/40"
        };
        res.json(defaultUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Staff routes are handled by hrRoutes.ts to avoid conflicts

  // Additional API routes can be added here

  // Dashboard KPIs
  app.get('/api/dashboard/kpis', isAuthenticated, async (req, res) => {
    try {
      const kpis = await storage.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  // Store routes
  app.get('/api/stores', isAuthenticated, async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.get('/api/stores/:id', isAuthenticated, async (req, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ message: "Failed to fetch store" });
    }
  });

  app.post('/api/stores', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(validatedData);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(400).json({ message: "Failed to create store" });
    }
  });

  app.put('/api/stores/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(req.params.id, validatedData);
      res.json(store);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(400).json({ message: "Failed to update store" });
    }
  });

  app.delete('/api/stores/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStore(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const { date } = req.query;
      let appointments;
      
      if (date && typeof date === 'string') {
        appointments = await storage.getAppointmentsByDate(date);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Only assign doctors for PAID appointments - pending appointments should not have doctor assignment
      console.log(`DEBUG: paymentStatus = "${validatedData.paymentStatus}", assignedDoctorId = "${validatedData.assignedDoctorId}"`);
      
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
      
      const appointment = await storage.createAppointment(validatedData);
      
      // Generate invoice for paid appointments - simplified logging only
      if (validatedData.paymentStatus === 'paid' && validatedData.appointmentFee) {
        const fee = parseFloat(validatedData.appointmentFee.toString());
        const invoiceNumber = `INV-APT-${Date.now()}`;
        const total = (fee * 1.08).toFixed(2);
        
        console.log(`✅ PAID APPOINTMENT - Invoice generated: ${invoiceNumber} for appointment ${appointment.id}, Amount: $${total}, Method: ${validatedData.paymentMethod || 'cash'}`);
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  app.put('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(400).json({ message: "Failed to update appointment" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      console.log(`🚨 ROUTE: /api/invoices called`);
      const invoices = await storage.getInvoices();
      console.log(`🚨 ROUTE: Got ${invoices.length} invoices from storage`);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  const createInvoiceSchema = z.object({
    customerId: z.string().min(1),
    storeId: z.string().min(1),
    dueDate: z.string().min(1),
    taxRate: z.union([z.number(), z.string()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    ),
    discountAmount: z.union([z.number(), z.string()]).transform(val => 
      typeof val === 'string' ? parseFloat(val) : val
    ),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      description: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.union([z.number(), z.string()]).transform(val => 
        typeof val === 'string' ? parseFloat(val) : val
      ),
      discount: z.union([z.number(), z.string()]).transform(val => 
        typeof val === 'string' ? parseFloat(val) : val
      ),
      total: z.union([z.number(), z.string()]).transform(val => 
        typeof val === 'string' ? parseFloat(val) : val
      ),
    })),
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      console.log(`📝 INVOICE CREATION REQUEST:`, JSON.stringify(req.body, null, 2));
      
      const validatedData = createInvoiceSchema.parse(req.body);
      const { items, ...invoiceData } = validatedData;
      
      console.log(`✅ VALIDATION PASSED - Items:`, items.length);
      
      // Calculate totals properly - all values are now numbers thanks to Zod transforms
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (invoiceData.taxRate / 100);
      const discountAmount = invoiceData.discountAmount;
      const total = subtotal + taxAmount - discountAmount;
      
      console.log(`💰 CALCULATIONS: Subtotal: ${subtotal}, Tax: ${taxAmount}, Discount: ${discountAmount}, Total: ${total}`);
      
      // Add invoice specific fields with proper calculations
      const invoiceWithDefaults = {
        customerId: invoiceData.customerId,
        storeId: invoiceData.storeId,
        dueDate: invoiceData.dueDate,
        taxRate: invoiceData.taxRate,
        discountAmount: invoiceData.discountAmount,
        paymentMethod: invoiceData.paymentMethod,
        notes: invoiceData.notes,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: 'draft',
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
      };
      
      const invoice = await storage.createInvoice(invoiceWithDefaults, items);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      res.status(400).json({ message: "Failed to create invoice", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Sales routes
  app.get('/api/sales', isAuthenticated, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  const createSaleSchema = insertSaleSchema.extend({
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.union([z.string(), z.number()]).transform(val => 
        typeof val === 'string' ? val : val.toString()
      ),
      totalPrice: z.union([z.string(), z.number()]).transform(val => 
        typeof val === 'string' ? val : val.toString()
      ),
    })),
    subtotal: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? val : val.toString()
    ),
    taxAmount: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? val : val.toString()
    ),
    total: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? val : val.toString()
    ),
    discountAmount: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? val : val.toString()
    ).optional(),
  });

  app.post('/api/sales', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating sale with request body:", JSON.stringify(req.body, null, 2));
      const validatedData = createSaleSchema.parse(req.body);
      const { items, ...saleData } = validatedData;
      
      // Add staff ID from authenticated user  
      const saleWithStaff = {
        ...saleData,
        staffId: req.user?.claims?.sub || "45761289", // Default to admin user
      };
      
      console.log("Sale data after validation:", JSON.stringify(saleWithStaff, null, 2));
      console.log("Sale items:", JSON.stringify(items, null, 2));
      
      const sale = await storage.createSale(saleWithStaff, items);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale - Full error:", error);
      if (error instanceof Error && 'issues' in error) {
        console.error("Validation issues:", (error as any).issues);
      }
      res.status(400).json({ 
        message: "Failed to create sale",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  // Inventory routes
  app.get('/api/inventory/:storeId', isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getStoreInventory(req.params.storeId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  const updateInventorySchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(0),
  });

  app.put('/api/inventory/:storeId', isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity } = updateInventorySchema.parse(req.body);
      const inventory = await storage.updateInventory(req.params.storeId, productId, quantity);
      res.json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(400).json({ message: "Failed to update inventory" });
    }
  });

  // Store Inventory routes (for new inventory management)
  app.get('/api/store-inventory', async (req, res) => {
    try {
      const storeId = req.query.storeId as string || "5ff902af-3849-4ea6-945b-4d49175d6638";
      const inventory = await storage.getStoreInventory(storeId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching store inventory:", error);
      res.status(500).json({ message: "Failed to fetch store inventory" });
    }
  });

  app.post('/api/store-inventory', async (req, res) => {
    try {
      const { storeId, productId, quantity } = req.body;
      if (!storeId || !productId || quantity === undefined) {
        return res.status(400).json({ message: "Missing required fields: storeId, productId, quantity" });
      }
      const inventory = await storage.updateInventory(storeId, productId, quantity);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  app.put('/api/store-inventory/:storeId/:productId', async (req, res) => {
    try {
      const { storeId, productId } = req.params;
      const { quantity } = req.body;
      if (quantity === undefined) {
        return res.status(400).json({ message: "Missing required field: quantity" });
      }
      const inventory = await storage.updateInventory(storeId, productId, quantity);
      res.json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  // Appointments routes (without authentication for demo)
  app.get("/api/appointments", async (req, res) => {
    try {
      // Mock appointments data
      const appointments = [
        {
          id: "1",
          customerId: "cust1",
          storeId: "store1", 
          staffId: "staff1",
          appointmentDate: new Date(),
          duration: 60,
          service: "Eye Exam",
          status: "scheduled",
          notes: "First time patient",
          customer: { firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567" },
          store: { name: "Downtown Store", address: "123 Main St" },
        },
        {
          id: "2",
          customerId: "cust2",
          storeId: "store1",
          staffId: "staff1", 
          appointmentDate: new Date(Date.now() + 86400000),
          duration: 30,
          service: "Frame Fitting",
          status: "confirmed",
          notes: "Bring existing glasses",
          customer: { firstName: "Michael", lastName: "Chen", phone: "(555) 987-6543" },
          store: { name: "Downtown Store", address: "123 Main St" },
        },
        {
          id: "3",
          customerId: "cust3",
          storeId: "store2",
          staffId: "staff2",
          appointmentDate: new Date(Date.now() + 172800000),
          duration: 45,
          service: "Contact Lens Fitting", 
          status: "completed",
          notes: "Follow-up in 2 weeks",
          customer: { firstName: "Emma", lastName: "Wilson", phone: "(555) 456-7890" },
          store: { name: "Mall Location", address: "456 Shopping Center" },
        }
      ];
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const data = req.body;
      const newAppointment = {
        id: Date.now().toString(),
        ...data,
        customer: { firstName: "New", lastName: "Customer", phone: "(555) 000-0000" },
        store: { name: "Downtown Store", address: "123 Main St" },
      };
      res.json(newAppointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      res.json({ id, ...data, message: "Appointment updated successfully" });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ id, message: "Appointment cancelled successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  // Appointment status update route
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Mock status update
      res.json({ 
        success: true, 
        message: `Appointment ${status} successfully`,
        id,
        status 
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Customers routes (for appointment form)
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = [
        { id: "cust1", firstName: "Sarah", lastName: "Johnson", phone: "(555) 123-4567", email: "sarah.j@email.com" },
        { id: "cust2", firstName: "Michael", lastName: "Chen", phone: "(555) 987-6543", email: "m.chen@email.com" },
        { id: "cust3", firstName: "Emma", lastName: "Wilson", phone: "(555) 456-7890", email: "emma.w@email.com" },
        { id: "cust4", firstName: "David", lastName: "Brown", phone: "(555) 321-0987", email: "d.brown@email.com" },
        { id: "cust5", firstName: "Lisa", lastName: "Garcia", phone: "(555) 654-3210", email: "lisa.g@email.com" }
      ];
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Note: Patient routes are now handled in medicalRoutes.ts to use real database data

  // Patient history route
  app.get("/api/patients/:id/history", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // Mock patient history data
      const history = [
        {
          id: "hist1",
          patientId: id,
          date: new Date(),
          type: "appointment",
          description: "Regular eye examination",
          doctor: "Dr. Smith",
          notes: "Vision improved, prescription updated"
        },
        {
          id: "hist2", 
          patientId: id,
          date: new Date(Date.now() - 86400000 * 30),
          type: "treatment",
          description: "Contact lens fitting",
          doctor: "Dr. Johnson",
          notes: "First time contact lens fitting successful"
        }
      ];
      res.json(history);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      res.status(500).json({ message: "Failed to fetch patient history" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      // Mock settings data including OAuth
      const settings = {
        general: {
          businessName: "OptiCare Medical Center",
          businessEmail: "info@opticare.com",
          businessPhone: "(555) 123-4567",
          businessAddress: "123 Medical Plaza, Healthcare City, HC 12345",
          businessWebsite: "https://www.opticare.com",
          taxId: "12-3456789",
          timeZone: "America/New_York",
          currency: "USD",
          dateFormat: "MM/dd/yyyy",
        },
        email: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUsername: "system@opticare.com",
          smtpPassword: "",
          fromEmail: "noreply@opticare.com",
          fromName: "OptiCare Medical Center",
          enableSSL: true,
        },
        oauth: {
          googleClientId: process.env.GOOGLE_CLIENT_ID || "",
          googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          twitterConsumerKey: process.env.TWITTER_CONSUMER_KEY || "",
          twitterConsumerSecret: process.env.TWITTER_CONSUMER_SECRET || "",
          appleClientId: process.env.APPLE_CLIENT_ID || "",
          appleTeamId: process.env.APPLE_TEAM_ID || "",
          appleKeyId: process.env.APPLE_KEY_ID || "",
          enableGoogleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
          enableTwitterAuth: !!(process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET),
          enableAppleAuth: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID),
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          appointmentReminders: true,
          billingAlerts: true,
          inventoryAlerts: true,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: false,
          },
        },
        system: {
          maintenanceMode: false,
          autoBackup: true,
          backupFrequency: "daily",
          debugMode: false,
          logLevel: "info",
        },
        billing: {
          defaultPaymentMethod: "card",
          taxRate: 8.25,
          lateFee: 25.00,
          paymentTerms: 30,
        },
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const data = req.body;
      
      // Mock update response
      if (section === 'oauth') {
        // Simulate saving OAuth credentials to environment or database
        console.log('OAuth settings updated:', data);
      }
      
      res.json({ 
        success: true, 
        message: `${section} settings updated successfully`,
        data 
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Custom fields routes
  app.get("/api/custom-fields", isAuthenticated, async (req, res) => {
    try {
      const { entityType } = req.query;
      const fields = await storage.getCustomFieldsConfig(entityType as string);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });

  app.post("/api/custom-fields", isAuthenticated, async (req, res) => {
    try {
      const field = await storage.createCustomFieldConfig(req.body);
      res.json(field);
    } catch (error) {
      console.error("Error creating custom field:", error);
      res.status(500).json({ message: "Failed to create custom field" });
    }
  });

  app.put("/api/custom-fields/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const field = await storage.updateCustomFieldConfig(id, req.body);
      res.json(field);
    } catch (error) {
      console.error("Error updating custom field:", error);
      res.status(500).json({ message: "Failed to update custom field" });
    }
  });

  app.delete("/api/custom-fields/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomFieldConfig(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom field:", error);
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = [
        {
          id: "1",
          title: "Appointment Reminder",
          message: "You have a patient appointment with Sarah Johnson at 2:00 PM today.",
          type: "appointment",
          priority: "high",
          isRead: false,
          sentAt: new Date().toISOString(),
          relatedType: "appointment",
          relatedId: "apt_001"
        },
        {
          id: "2",
          title: "Payment Received",
          message: "Payment of $250.00 received from John Smith for Invoice #INV-001.",
          type: "billing",
          priority: "normal",
          isRead: true,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          relatedType: "payment",
          relatedId: "pay_001"
        },
        {
          id: "3",
          title: "Low Inventory Alert",
          message: "Contact lenses stock is running low. Only 5 units remaining.",
          type: "inventory",
          priority: "urgent",
          isRead: false,
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          relatedType: "product",
          relatedId: "prod_001"
        },
        {
          id: "4",
          title: "New Patient Registration",
          message: "Maria Rodriguez has completed online registration and needs appointment scheduling.",
          type: "patient",
          priority: "normal",
          isRead: false,
          sentAt: new Date(Date.now() - 10800000).toISOString(),
          relatedType: "patient",
          relatedId: "pat_001"
        },
        {
          id: "5",
          title: "System Backup Complete",
          message: "Daily database backup completed successfully at 3:00 AM.",
          type: "system",
          priority: "low",
          isRead: true,
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          relatedType: "system",
          relatedId: "backup_001"
        },
        {
          id: "6",
          title: "Staff Leave Request",
          message: "Dr. Anderson has requested leave for March 15-20, 2025. Approval needed.",
          type: "hr",
          priority: "high",
          isRead: false,
          sentAt: new Date(Date.now() - 14400000).toISOString(),
          relatedType: "leave",
          relatedId: "leave_001"
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // Mock implementation - in real app this would update database
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      // Mock implementation - in real app this would delete from database
      res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });



  // Dashboard route
  app.get('/api/dashboard', isAuthenticated, async (req, res) => {
    try {
      const { storeId, dateRange } = req.query;
      
      // Get dashboard analytics data
      const dashboardData = {
        totalSales: 24500,
        totalAppointments: 48,
        totalPatients: 156,
        totalRevenue: 18200,
        salesGrowth: 12.5,
        appointmentGrowth: 8.3,
        patientGrowth: 15.2,
        revenueGrowth: 9.7,
        appointmentsToday: 12,
        lowStockAlerts: 3,
        pendingPayments: 5
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Register medical practice routes
  // registerMedicalRoutes(app); // Already registered above to avoid route conflicts
  
  // Register HR management routes
  registerHRRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
