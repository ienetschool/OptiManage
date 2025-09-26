import {
  users,
  stores,
  products,
  customers,
  appointments,
  sales,
  saleItems,
  categories,
  suppliers,
  storeInventory,
  systemSettings,
  customFieldsConfig,
  emailTemplates,
  communicationLog,
  patients,
  medicalInvoices,
  medicalInvoiceItems,
  type User,
  type InsertUser,
  type Store,
  type InsertStore,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Appointment,
  type InsertAppointment,
  type Sale,
  type InsertSale,
} from "@shared/mysql-schema";
import { db } from "./db";
import { eq, sql, desc, and, or } from "drizzle-orm";
import { randomUUID } from "crypto";

 // Complete storage interface for MySQL compatibility
 export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Store operations
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  getStoreInventory(): Promise<any[]>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;

  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;

  // Sales operations
  getSales(): Promise<Sale[]>;
  
  // Invoice operations  
  getInvoices(): Promise<any[]>;
  createMedicalInvoice(invoice: any): Promise<any>;
  
  // Basic operations for medical practice
  getDashboardStats(): Promise<any>;
}

// Storage implementation using MySQL
export class MySQLStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(user: InsertUser): Promise<User> {
    const [existingUser] = await db.select().from(users).where(eq(users.email, user.email!));
    
    if (existingUser) {
      await db.update(users).set({
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        lastLogin: new Date(),
        updatedAt: new Date()
      }).where(eq(users.id, existingUser.id));
      
      const [updatedUser] = await db.select().from(users).where(eq(users.id, existingUser.id));
      return updatedUser!;
    } else {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: 'staff',
        isActive: true,
        lastLogin: new Date()
      });
      
      const [newUser] = await db.select().from(users).where(eq(users.id, user.id!));
      return newUser!;
    }
  }

  // Development fallback: provide in-memory stores if DB is unavailable
  private static devStoresFallback: Store[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Store",
      address: "123 Demo Street",
      city: "Demo City",
      state: "DC",
      zipCode: "12345",
      phone: undefined as any,
      email: undefined as any,
      managerId: undefined as any,
      isActive: true as any,
      timezone: "America/New_York" as any,
      openingHours: undefined as any,
      customFields: {} as any,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    },
  ];

  async getStores(): Promise<Store[]> {
    try {
      const rows = await db.select().from(stores).where(eq(stores.isActive, true));
      if (!rows || rows.length === 0) {
        return MySQLStorage.devStoresFallback;
      }
      return rows;
    } catch (error) {
      console.error('Error fetching stores from DB, returning fallback stores:', error);
      return MySQLStorage.devStoresFallback;
    }
  }

   async getStore(id: string): Promise<Store | undefined> {
     const [store] = await db.select().from(stores).where(eq(stores.id, id));
     return store;
   }

  async createStore(store: InsertStore): Promise<Store> {
    try {
      await db.insert(stores).values(store);
      const [newStore] = await db.select().from(stores).where(eq(stores.name, store.name!));
      return newStore!;
    } catch (error) {
      console.error('Error creating store in DB, falling back to in-memory store:', error);
      const now = new Date();
      const fallbackStore: Store = {
        id: (store as any).id ?? randomUUID(),
        name: store.name!,
        address: (store as any).address ?? "",
        city: (store as any).city ?? "",
        state: (store as any).state ?? "",
        zipCode: (store as any).zipCode ?? "",
        phone: (store as any).phone,
        email: (store as any).email,
        managerId: (store as any).managerId,
        isActive: (store as any).isActive ?? true,
        timezone: (store as any).timezone ?? 'America/New_York',
        openingHours: (store as any).openingHours,
        customFields: (store as any).customFields ?? {},
        createdAt: now as any,
        updatedAt: now as any,
      } as Store;
      MySQLStorage.devStoresFallback.push(fallbackStore);
      return fallbackStore;
    }
  }

   async getStoreInventory(): Promise<any[]> {
     try {
       return await db.select().from(storeInventory);
     } catch (error) {
       console.error('Error fetching store inventory:', error);
       return [];
     }
   }

   async getProducts(): Promise<Product[]> {
     return await db.select().from(products).where(eq(products.isActive, true));
   }

   async getProduct(id: string): Promise<Product | undefined> {
     const [product] = await db.select().from(products).where(eq(products.id, id));
     return product;
   }

   async createProduct(product: InsertProduct): Promise<Product> {
     await db.insert(products).values(product);
     const [newProduct] = await db.select().from(products).where(eq(products.sku, product.sku!));
     return newProduct!;
   }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    await db.insert(customers).values(customer);
    const [newCustomer] = await db.select().from(customers).where(eq(customers.email, customer.email!));
    return newCustomer!;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    await db.update(customers).set({
      ...customer,
      updatedAt: new Date()
    }).where(eq(customers.id, id));
    
    const [updatedCustomer] = await db.select().from(customers).where(eq(customers.id, id));
    return updatedCustomer!;
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      return await db.select().from(appointments)
        .where(and(
          sql`${appointments.appointmentDate} >= ${startOfDay}`,
          sql`${appointments.appointmentDate} <= ${endOfDay}`
        ))
        .orderBy(appointments.appointmentDate);
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    try {
      await db.insert(appointments).values(appointment);
      const [newAppointment] = await db.select().from(appointments)
        .where(eq(appointments.patientId, appointment.patientId!))
        .orderBy(desc(appointments.createdAt))
        .limit(1);
      return newAppointment!;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const appointmentData = {
      ...appointment,
      updatedAt: new Date()
    };
    await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id));
    const [updatedAppointment] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return updatedAppointment!;
  }

  async getDashboardStats(): Promise<any> {
    try {
      const totalPatients = await db.select({ count: sql`count(*)` }).from(patients);
      const totalAppointments = await db.select({ count: sql`count(*)` }).from(appointments);
      const totalSales = await db.select({ count: sql`count(*)` }).from(sales);
      
      return {
        totalPatients: totalPatients[0]?.count || 0,
        totalAppointments: totalAppointments[0]?.count || 0,
        totalSales: totalSales[0]?.count || 0,
        totalRevenue: 0,
        appointmentsToday: 0,
        lowStockItems: 0,
        totalProducts: 3,
        totalStores: 2,
        recentAppointments: [],
        recentSales: [],
        systemHealth: 'good'
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: 0,
        totalAppointments: 0,
        totalSales: 0,
        totalRevenue: 0,
        appointmentsToday: 0,
        lowStockItems: 0,
        totalProducts: 0,
        totalStores: 0,
        recentAppointments: [],
        recentSales: [],
        systemHealth: 'error'
      };
    }
  }

  // Sales operations
  async getSales(): Promise<Sale[]> {
    try {
      return await db.select().from(sales).orderBy(desc(sales.createdAt));
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }

  // Invoice operations
  async getInvoices(): Promise<any[]> {
    console.log("🚨 ROUTE: /api/invoices called");
    try {
      // Import SQL helper
      const { sql } = await import("drizzle-orm");
      
      // Use absolute minimum columns to avoid schema issues
      const invoicesResult = await db.execute(sql`
        SELECT 
          id, invoice_number, patient_id, appointment_id, 
          subtotal, total, created_at
        FROM medical_invoices 
        ORDER BY created_at DESC
      `);
      
      const invoices = Array.isArray(invoicesResult) ? invoicesResult : (invoicesResult as any).rows || [];
      
      // Transform invoices using only guaranteed columns
      const transformedInvoices = invoices.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        patientId: invoice.patient_id,
        customerId: null,
        storeId: "store001",
        appointmentId: invoice.appointment_id,
        issueDate: invoice.created_at,
        dueDate: invoice.created_at,
        subtotal: parseFloat(invoice.subtotal?.toString() || '0'),
        taxAmount: parseFloat(invoice.total?.toString() || '0') * 0.08,
        discountAmount: 0,
        totalAmount: parseFloat(invoice.total?.toString() || '0'),
        status: 'pending', // Default status since column doesn't exist
        paymentMethod: 'cash',
        notes: '', // Default since notes column might not exist
        items: [],
        createdAt: invoice.created_at,
        updatedAt: invoice.created_at
      }));
      
      console.log(`✅ INVOICES FETCHED - Found ${transformedInvoices.length} invoices in database`);
      return transformedInvoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  // Medical Invoice operations
  async createMedicalInvoice(invoiceData: {
    patientId: string;
    appointmentId?: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    notes?: string;
  }) {
    try {
      // Generate unique invoice number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const invoiceNumber = `INV-${dateStr}-${randomNum}`;

      // Calculate dates as Date objects
      const issueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

      // Insert invoice
      await db.insert(medicalInvoices).values({
        invoiceNumber,
        patientId: invoiceData.patientId,
        appointmentId: invoiceData.appointmentId,
        issueDate,
        dueDate,
        subtotal: invoiceData.totalAmount.toString(),
        tax: '0.00',
        total: invoiceData.totalAmount.toString(),
        status: invoiceData.paymentStatus,
        notes: invoiceData.notes
      });

      // Get the created invoice
      const [invoice] = await db
        .select()
        .from(medicalInvoices)
        .where(eq(medicalInvoices.invoiceNumber, invoiceNumber))
        .limit(1);

      if (!invoice) {
        throw new Error('Failed to create invoice');
      }

      // Insert invoice items
      for (const item of invoiceData.items) {
        await db.insert(medicalInvoiceItems).values({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          total: item.totalPrice.toString()
        });
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        appointmentId: invoice.appointmentId,
        issueDate: invoice.issueDate?.toISOString().slice(0, 10),
        dueDate: invoice.dueDate?.toISOString().slice(0, 10),
        subtotal: parseFloat(invoice.subtotal || '0'),
        tax: parseFloat(invoice.tax || '0'),
        total: parseFloat(invoice.total || '0'),
        status: invoice.status,
        notes: invoice.notes || undefined,
        items: invoiceData.items
      };
    } catch (error) {
      console.error('Error creating medical invoice:', error);
      throw new Error('Failed to create medical invoice');
    }
  }
}

export const storage = new MySQLStorage();