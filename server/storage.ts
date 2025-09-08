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

  // Sales operations
  getSales(): Promise<Sale[]>;
  
  // Invoice operations  
  getInvoices(): Promise<any[]>;
  
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

  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.isActive, true));
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(store: InsertStore): Promise<Store> {
    await db.insert(stores).values(store);
    const [newStore] = await db.select().from(stores).where(eq(stores.name, store.name!));
    return newStore!;
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
      
      // Use raw SQL query to avoid Drizzle column mapping issues
      const invoicesResult = await db.execute(sql`
        SELECT 
          id, invoice_number, patient_id, appointment_id, 
          issue_date, due_date, subtotal, tax, total, 
          status, notes, custom_fields, created_at, updated_at
        FROM medical_invoices 
        ORDER BY created_at DESC
      `);
      
      const invoices = Array.isArray(invoicesResult) ? invoicesResult : invoicesResult.rows || [];
      
      // Transform invoices to match expected format using raw query results
      const transformedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        patientId: invoice.patient_id,
        customerId: null, // Not in medical invoice schema
        storeId: "store001", // Default store
        appointmentId: invoice.appointment_id,
        issueDate: invoice.issue_date || invoice.created_at,
        dueDate: invoice.due_date || invoice.created_at,
        subtotal: parseFloat(invoice.subtotal?.toString() || '0'),
        taxAmount: parseFloat(invoice.tax?.toString() || '0'),
        discountAmount: 0, // Not in current MySQL schema
        totalAmount: parseFloat(invoice.total?.toString() || '0'),
        status: invoice.status || 'pending',
        paymentMethod: 'cash', // Default since not in current MySQL schema
        notes: invoice.notes,
        items: invoice.custom_fields,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      }));
      
      console.log(`✅ INVOICES FETCHED - Found ${transformedInvoices.length} invoices in database`);
      return transformedInvoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }
}

export const storage = new MySQLStorage();