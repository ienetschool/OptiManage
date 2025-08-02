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
  type User,
  type UpsertUser,
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
  type SaleItem,
  type Category,
  type InsertCategory,
  type Supplier,
  type InsertSupplier,
  type StoreInventory,
  type SystemSettings,
  type InsertSystemSettings,
  type CustomFieldConfig,
  type InsertCustomFieldConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Store operations
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store>;
  deleteStore(id: string): Promise<void>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Sales operations
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale, items: Omit<SaleItem, 'id' | 'saleId'>[]): Promise<Sale>;
  getSaleItems(saleId: string): Promise<SaleItem[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Inventory operations
  getStoreInventory(storeId: string): Promise<StoreInventory[]>;
  updateInventory(storeId: string, productId: string, quantity: number): Promise<StoreInventory>;

  // Dashboard KPIs
  getDashboardKPIs(): Promise<{
    dailySales: number;
    appointmentsToday: number;
    lowStockItems: number;
    activeCustomers: number;
  }>;

  // System Settings operations
  getSystemSettings(category?: string): Promise<SystemSettings[]>;
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  updateSystemSetting(key: string, value: string, category: string): Promise<SystemSettings>;

  // Custom Fields operations
  getCustomFieldsConfig(entityType?: string): Promise<CustomFieldConfig[]>;
  createCustomFieldConfig(config: InsertCustomFieldConfig): Promise<CustomFieldConfig>;
  updateCustomFieldConfig(id: string, config: Partial<InsertCustomFieldConfig>): Promise<CustomFieldConfig>;
  deleteCustomFieldConfig(id: string): Promise<void>;
  
  // Staff operations
  getStaff(): Promise<any[]>;
  getStaffMember(id: string): Promise<any | undefined>;
  createStaff(staff: any): Promise<any>;
  updateStaff(id: string, staff: any): Promise<any>;
  deleteStaff(id: string): Promise<void>;

  // Invoice operations
  getInvoices(): Promise<any[]>;
  getInvoice(id: string): Promise<any | undefined>;
  createInvoice(invoice: any, items: any[]): Promise<any>;
  updateInvoice(id: string, invoice: any): Promise<any>;
  deleteInvoice(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Store operations
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(stores.name);
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async updateStore(id: string, store: Partial<InsertStore>): Promise<Store> {
    const [updatedStore] = await db
      .update(stores)
      .set({ ...store, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return updatedStore;
  }

  async deleteStore(id: string): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.lastName, customers.firstName);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(appointments)
      .where(
        and(
          sql`${appointments.appointmentDate} >= ${startOfDay}`,
          sql`${appointments.appointmentDate} <= ${endOfDay}`
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Convert number appointmentFee to string if needed
    const appointmentData = {
      ...appointment,
      appointmentFee: appointment.appointmentFee ? appointment.appointmentFee.toString() : undefined,
    };
    const [newAppointment] = await db.insert(appointments).values(appointmentData).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    // Convert number appointmentFee to string if needed
    const appointmentData = {
      ...appointment,
      appointmentFee: appointment.appointmentFee ? appointment.appointmentFee.toString() : undefined,
      updatedAt: new Date()
    };
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Sales operations
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale, items: Omit<SaleItem, 'id' | 'saleId'>[]): Promise<Sale> {
    return await db.transaction(async (tx) => {
      const saleData = {
        ...sale,
        staffId: sale.staffId || 'system' // Provide default value for staffId
      };
      const [newSale] = await tx.insert(sales).values([saleData]).returning();
      
      const saleItemsToInsert = items.map(item => ({
        ...item,
        saleId: newSale.id,
      }));
      
      await tx.insert(saleItems).values(saleItemsToInsert);
      
      // Update inventory (optional - only if storeId is provided)
      if (sale.storeId) {
        for (const item of items) {
          await tx
            .update(storeInventory)
            .set({
              quantity: sql`${storeInventory.quantity} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(storeInventory.storeId, sale.storeId),
                eq(storeInventory.productId, item.productId)
              )
            );
        }
      }
      
      return newSale;
    });
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  // Inventory operations
  async getStoreInventory(storeId: string): Promise<StoreInventory[]> {
    return await db.select().from(storeInventory).where(eq(storeInventory.storeId, storeId));
  }

  async updateInventory(storeId: string, productId: string, quantity: number): Promise<StoreInventory> {
    const [inventory] = await db
      .insert(storeInventory)
      .values({
        storeId,
        productId,
        quantity,
        lastRestocked: new Date(),
      })
      .onConflictDoUpdate({
        target: [storeInventory.storeId, storeInventory.productId],
        set: {
          quantity,
          lastRestocked: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return inventory;
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<{
    dailySales: number;
    appointmentsToday: number;
    lowStockItems: number;
    activeCustomers: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Daily sales
    const [dailySalesResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${sales.total}), 0)` })
      .from(sales)
      .where(
        and(
          sql`${sales.createdAt} >= ${startOfDay}`,
          sql`${sales.createdAt} <= ${endOfDay}`
        )
      );

    // Appointments today
    const [appointmentsTodayResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appointments)
      .where(
        and(
          sql`${appointments.appointmentDate} >= ${startOfDay}`,
          sql`${appointments.appointmentDate} <= ${endOfDay}`
        )
      );

    // Low stock items (inventory below reorder level)
    const [lowStockResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
      .from(products)
      .innerJoin(storeInventory, eq(products.id, storeInventory.productId))
      .where(
        and(
          eq(products.isActive, true),
          sql`${storeInventory.quantity} <= ${products.reorderLevel}`
        )
      );

    // Active customers (customers with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activeCustomersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${customers.id})` })
      .from(customers)
      .leftJoin(sales, eq(customers.id, sales.customerId))
      .leftJoin(appointments, eq(customers.id, appointments.customerId))
      .where(
        or(
          sql`${sales.createdAt} >= ${thirtyDaysAgo}`,
          sql`${appointments.createdAt} >= ${thirtyDaysAgo}`
        )
      );

    return {
      dailySales: Number(dailySalesResult.total) || 0,
      appointmentsToday: Number(appointmentsTodayResult.count) || 0,
      lowStockItems: Number(lowStockResult.count) || 0,
      activeCustomers: Number(activeCustomersResult.count) || 0,
    };
  }

  // System Settings operations
  async getSystemSettings(category?: string): Promise<SystemSettings[]> {
    if (category) {
      return await db.select().from(systemSettings).where(eq(systemSettings.category, category));
    }
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(key: string, value: string, category: string): Promise<SystemSettings> {
    const [setting] = await db
      .insert(systemSettings)
      .values({ key, value, category })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  // Custom Fields operations
  async getCustomFieldsConfig(entityType?: string): Promise<CustomFieldConfig[]> {
    if (entityType) {
      return await db.select().from(customFieldsConfig).where(eq(customFieldsConfig.entityType, entityType));
    }
    return await db.select().from(customFieldsConfig).where(eq(customFieldsConfig.isActive, true));
  }

  async createCustomFieldConfig(config: InsertCustomFieldConfig): Promise<CustomFieldConfig> {
    // Handle array field options properly
    const configData = {
      ...config,
      fieldOptions: Array.isArray(config.fieldOptions) ? config.fieldOptions as string[] : null,
    };
    const [newConfig] = await db.insert(customFieldsConfig).values([configData]).returning();
    return newConfig;
  }

  async updateCustomFieldConfig(id: string, config: Partial<InsertCustomFieldConfig>): Promise<CustomFieldConfig> {
    // Handle array field options properly
    const configData = {
      ...config,
      fieldOptions: Array.isArray(config.fieldOptions) ? config.fieldOptions as string[] : null,
    };
    const [updatedConfig] = await db
      .update(customFieldsConfig)
      .set(configData)
      .where(eq(customFieldsConfig.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteCustomFieldConfig(id: string): Promise<void> {
    await db.delete(customFieldsConfig).where(eq(customFieldsConfig.id, id));
  }

  // Staff operations
  async getStaff(): Promise<any[]> {
    // Return mock staff data for now since we need to set up the staff table properly
    return [
      {
        id: "1",
        staffCode: "STF-001",
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@optistorepro.com",
        phone: "+1-555-0101",
        address: "123 Medical St, City, State 12345",
        position: "Doctor",
        department: "Medical",
        hireDate: "2023-01-15",
        status: "active",
        role: "doctor",
        permissions: ["prescriptions", "appointments", "medical_records"],
        customFields: {},
        createdAt: "2023-01-15T00:00:00Z",
        updatedAt: "2023-01-15T00:00:00Z"
      },
      {
        id: "2",
        staffCode: "STF-002",
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.chen@optistorepro.com",
        phone: "+1-555-0102",
        address: "456 Business Ave, City, State 12345",
        position: "Optometrist",
        department: "Medical",
        hireDate: "2023-02-01",
        status: "active",
        role: "doctor",
        permissions: ["prescriptions", "appointments", "eye_exams"],
        customFields: {},
        createdAt: "2023-02-01T00:00:00Z",
        updatedAt: "2023-02-01T00:00:00Z"
      },
      {
        id: "3",
        staffCode: "STF-003",
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@optistorepro.com",
        phone: "+1-555-0103",
        address: "789 Commerce Blvd, City, State 12345",
        position: "Receptionist",
        department: "Administration",
        hireDate: "2023-03-10",
        status: "active",
        role: "staff",
        permissions: ["appointments", "customer_service"],
        customFields: {},
        createdAt: "2023-03-10T00:00:00Z",
        updatedAt: "2023-03-10T00:00:00Z"
      }
    ];
  }

  async getStaffMember(id: string): Promise<any | undefined> {
    const staff = await this.getStaff();
    return staff.find(s => s.id === id);
  }

  async createStaff(staffData: any): Promise<any> {
    const newStaff = {
      id: Date.now().toString(),
      ...staffData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newStaff;
  }

  async updateStaff(id: string, staffData: any): Promise<any> {
    const updatedStaff = {
      id,
      ...staffData,
      updatedAt: new Date().toISOString()
    };
    return updatedStaff;
  }

  async deleteStaff(id: string): Promise<void> {
    // Mock deletion for now
    console.log(`Staff member ${id} deleted`);
  }

  // Invoice operations - Include invoices from Quick Sales and created invoices
  async getInvoices(): Promise<any[]> {
    try {
      // Get real sales data to create invoices from Quick Sales
      const sales = await this.getSales();
      const realInvoices = sales.map(sale => ({
        id: `invoice-${sale.id}`,
        invoiceNumber: `INV-${sale.id.slice(-8)}`,
        customerId: sale.customerId || "guest",
        customerName: sale.customerId ? "Customer" : "Guest Customer", // Will be resolved in frontend
        storeId: sale.storeId,
        storeName: "OptiStore Pro",
        date: sale.createdAt || new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subtotal: parseFloat(sale.subtotal || "0"),
        taxRate: parseFloat(sale.taxAmount || "0") > 0 ? 10 : 0,
        taxAmount: parseFloat(sale.taxAmount || "0"),
        discountAmount: 0,
        total: parseFloat(sale.total || "0"),
        status: sale.paymentStatus === "paid" ? "paid" : "pending",
        paymentMethod: sale.paymentMethod || "cash",
        notes: sale.notes || `Quick Sale - ${sale.paymentMethod}`,
        items: [] // Items would be fetched separately in a real implementation
      }));

      // Add manually created invoices (sample data)
      const manualInvoices = [
        {
          id: "inv-001",
          invoiceNumber: "INV-001",
          customerId: "cust-001",
          customerName: "Sarah Johnson",
          storeId: "store-001",
          storeName: "OptiStore Downtown",
          date: new Date().toISOString(),
          dueDate: "2025-09-01",
          subtotal: 250,
          taxRate: 8.5,
          taxAmount: 21.25,
          discountAmount: 0,
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
              unitPrice: 150,
              discount: 0,
              total: 150
            },
            {
              id: "item-002",
              productId: "prod-002",
              productName: "Designer Frame",
              description: "Premium designer eyeglass frame",
              quantity: 1,
              unitPrice: 100,
              discount: 0,
              total: 100
            }
          ]
        }
      ];

      return [...realInvoices, ...manualInvoices];
    } catch (error) {
      console.error("Error getting invoices:", error);
      return [];
    }
  }

  async getInvoice(id: string): Promise<any | undefined> {
    const invoices = await this.getInvoices();
    return invoices.find(inv => inv.id === id);
  }

  async createInvoice(invoice: any, items: any[]): Promise<any> {
    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'draft',
      ...invoice,
      items: items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        ...item
      }))
    };
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: any): Promise<any> {
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    // Implementation for deletion
  }
}

export const storage = new DatabaseStorage();
