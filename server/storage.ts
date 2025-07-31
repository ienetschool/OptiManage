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
  patientHistory,
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
  type Patient,
  type InsertPatient,
  type PatientHistory,
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

  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
  getPatientHistory(patientId: string): Promise<PatientHistory[]>;
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
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
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
      const [newSale] = await tx.insert(sales).values(sale).returning();
      
      const saleItemsToInsert = items.map(item => ({
        ...item,
        saleId: newSale.id,
      }));
      
      await tx.insert(saleItems).values(saleItemsToInsert);
      
      // Update inventory
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
    const [newConfig] = await db.insert(customFieldsConfig).values(config).returning();
    return newConfig;
  }

  async updateCustomFieldConfig(id: string, config: Partial<InsertCustomFieldConfig>): Promise<CustomFieldConfig> {
    const [updatedConfig] = await db
      .update(customFieldsConfig)
      .set(config)
      .where(eq(customFieldsConfig.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteCustomFieldConfig(id: string): Promise<void> {
    await db.delete(customFieldsConfig).where(eq(customFieldsConfig.id, id));
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(patients.firstName, patients.lastName);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    // Generate patient code if not provided
    const patientData = {
      ...patient,
      patientCode: patient.patientCode || `PAT-${Date.now().toString().slice(-6)}`,
    };
    
    const [newPatient] = await db.insert(patients).values(patientData).returning();
    return newPatient;
  }

  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient> {
    const [updatedPatient] = await db
      .update(patients)
      .set({ ...patient, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }

  async getPatientHistory(patientId: string): Promise<PatientHistory[]> {
    return await db.select().from(patientHistory).where(eq(patientHistory.patientId, patientId)).orderBy(desc(patientHistory.recordDate));
  }
}

export const storage = new DatabaseStorage();
