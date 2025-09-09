import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  passwordHash: varchar("password_hash"),
  role: varchar("role").default('staff'), // admin, manager, doctor, nurse, receptionist, technician, staff
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stores
export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  managerId: varchar("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  timezone: varchar("timezone").default('America/New_York'),
  openingHours: text("opening_hours"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  sku: varchar("sku").unique().notNull(),
  barcode: varchar("barcode").unique(), // Auto-generated or manual barcode
  categoryId: varchar("category_id").references(() => categories.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  productType: varchar("product_type").default('frames'), // frames, lenses, sunglasses, accessories, contact_lenses, solutions
  reorderLevel: integer("reorder_level").default(10),
  isActive: boolean("is_active").default(true),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Store Inventory
export const storeInventory = pgTable("store_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(0),
  reservedQuantity: integer("reserved_quantity").default(0), // Reserved for pending orders
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock").default(100),
  location: varchar("location"), // Shelf location or storage area
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  loyaltyPoints: integer("loyalty_points").default(0),
  loyaltyTier: varchar("loyalty_tier").default('Bronze'), // Bronze, Silver, Gold
  notes: text("notes"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id),
  assignedDoctorId: varchar("assigned_doctor_id").references(() => users.id), // Doctor assignment
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(60), // minutes
  service: varchar("service").notNull(),
  appointmentFee: decimal("appointment_fee", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status").default('pending'), // pending, paid, refunded, cancelled
  paymentMethod: varchar("payment_method"), // cash, card, insurance, online
  paymentDate: timestamp("payment_date"),
  status: varchar("status").default('scheduled'), // scheduled, confirmed, checked-in, in-progress, completed, cancelled, no-show
  priority: varchar("priority").default('normal'), // low, normal, high, urgent
  notes: text("notes"),
  doctorNotes: text("doctor_notes"), // Private notes for doctors
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  staffId: varchar("staff_id").references(() => users.id).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // cash, card, check, digital
  paymentStatus: varchar("payment_status").default('completed'), // pending, completed, refunded
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sale Items
export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").references(() => sales.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // smtp, payment, general, security
  key: varchar("key").notNull(),
  value: text("value"),
  isEncrypted: boolean("is_encrypted").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Fields Configuration
export const customFieldsConfig = pgTable("custom_fields_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // stores, products, customers, appointments
  fieldName: varchar("field_name").notNull(),
  fieldType: varchar("field_type").notNull(), // text, number, date, select, boolean
  fieldOptions: jsonb("field_options").$type<string[]>(), // for select fields
  isRequired: boolean("is_required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  body: text("body").notNull(),
  templateType: varchar("template_type").notNull(), // appointment_reminder, welcome, invoice
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication Log
export const communicationLog = pgTable("communication_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  type: varchar("type").notNull(), // email, sms
  recipient: varchar("recipient").notNull(),
  subject: varchar("subject"),
  message: text("message").notNull(),
  status: varchar("status").default('sent'), // sent, delivered, failed
  sentAt: timestamp("sent_at").defaultNow(),
});

// Relations
export const storeRelations = relations(stores, ({ one, many }) => ({
  manager: one(users, {
    fields: [stores.managerId],
    references: [users.id],
  }),
  inventory: many(storeInventory),
  appointments: many(appointments),
  sales: many(sales),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventory: many(storeInventory),
  saleItems: many(saleItems),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  appointments: many(appointments),
  sales: many(sales),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  store: one(stores, {
    fields: [appointments.storeId],
    references: [stores.id],
  }),
  staff: one(users, {
    fields: [appointments.staffId],
    references: [users.id],
  }),
}));

export const saleRelations = relations(sales, ({ one, many }) => ({
  store: one(stores, {
    fields: [sales.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  staff: one(users, {
    fields: [sales.staffId],
    references: [users.id],
  }),
  items: many(saleItems),
}));

export const saleItemRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

// Purchase Orders and Stock Management
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderNumber: varchar("purchase_order_number").unique().notNull(),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: varchar("status").default('pending'), // pending, ordered, partial, delivered, cancelled
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status").default('pending'), // pending, paid, partial
  paymentMethod: varchar("payment_method"), // cash, card, check, bank_transfer
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stock Movements for tracking inventory changes
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  movementType: varchar("movement_type").notNull(), // in, out, adjustment, transfer
  quantity: integer("quantity").notNull(), // positive for in, negative for out
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  reference: varchar("reference"), // sale_id, purchase_order_id, etc.
  referenceType: varchar("reference_type"), // sale, purchase, adjustment, transfer
  reason: text("reason"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  initialStock: z.number().int().min(0).optional(), // For initial stock quantity when creating product
  barcode: z.string().optional(),
});

// Purchase order schemas
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  appointmentDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  appointmentFee: z.union([z.string(), z.number()]).transform((val) => 
    Number(val)
  ).optional(),
  paymentDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().nullable(),
  assignedDoctorId: z.string().optional().nullable(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
}).extend({
  staffId: z.string().optional(),
  customerId: z.string().optional().nullable(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertCustomFieldConfigSchema = createInsertSchema(customFieldsConfig).omit({
  id: true,
  createdAt: true,
});

// Medical practice insert schemas will be added at the end

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Export all type definitions
export type Store = typeof stores.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type CustomFieldConfig = typeof customFieldsConfig.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type CommunicationLog = typeof communicationLog.$inferSelect;

// Insert type definitions
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type InsertCustomFieldConfig = z.infer<typeof insertCustomFieldConfigSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;

// Staff Profiles with enhanced role management
export const staffProfiles = pgTable("staff_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  staffCode: varchar("staff_code").unique().notNull(),
  jobTitle: varchar("job_title").notNull(), // Doctor, Nurse, Receptionist, Technician, etc.
  department: varchar("department").notNull(), // Medical, Administration, Technical, etc.
  specialization: varchar("specialization"), // For doctors/specialists
  licenseNumber: varchar("license_number"), // Medical license for doctors
  permissions: jsonb("permissions").$type<string[]>().default(sql`'[]'::jsonb`), // Array of permission strings
  workSchedule: jsonb("work_schedule").$type<Record<string, any>>(), // Weekly schedule
  salary: decimal("salary", { precision: 12, scale: 2 }),
  hireDate: date("hire_date").notNull(),
  status: varchar("status").default('active'), // active, inactive, on_leave, terminated
  supervisorId: varchar("supervisor_id").references(() => users.id),
  emergencyContact: jsonb("emergency_contact").$type<Record<string, any>>(),
  qualifications: jsonb("qualifications").$type<string[]>().default(sql`'[]'::jsonb`),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointment Doctor Actions (for tracking doctor assignments and actions)
export const appointmentActions = pgTable("appointment_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id).notNull(),
  doctorId: varchar("doctor_id").references(() => users.id).notNull(),
  actionType: varchar("action_type").notNull(), // assigned, started, completed, prescription_created, notes_added
  notes: text("notes"),
  actionDate: timestamp("action_date").defaultNow(),
});

// Prescriptions Management
export const appointmentPrescriptions = pgTable("appointment_prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: varchar("doctor_id").references(() => users.id).notNull(),
  prescriptionCode: varchar("prescription_code").unique().notNull(),
  medications: jsonb("medications").$type<Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>().notNull(),
  diagnosis: text("diagnosis"),
  symptoms: text("symptoms"),
  treatmentPlan: text("treatment_plan"),
  followUpDate: date("follow_up_date"),
  status: varchar("status").default('active'), // active, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role Permissions Configuration
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleName: varchar("role_name").notNull(), // doctor, nurse, receptionist, admin, manager
  module: varchar("module").notNull(), // patients, appointments, prescriptions, inventory, sales
  permissions: jsonb("permissions").$type<string[]>().notNull(), // read, write, delete, approve
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctors table for medical practice
export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id), // Link to users table for authentication
  doctorCode: varchar("doctor_code", { length: 20 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patients table (enhanced customers for medical context with integrated medical records)
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientCode: varchar("patient_code", { length: 20 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }), // male, female, other
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  bloodGroup: varchar("blood_group", { length: 5 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  insuranceProvider: varchar("insurance_provider", { length: 100 }),
  insuranceNumber: varchar("insurance_number", { length: 50 }),
  
  // Extended Medical Records Fields (merged from medical records module)
  currentMedications: text("current_medications"),
  previousEyeConditions: text("previous_eye_conditions"),
  lastEyeExamDate: date("last_eye_exam_date"),
  currentPrescription: varchar("current_prescription", { length: 200 }),
  riskFactors: varchar("risk_factors", { length: 20 }).default("low"), // low, moderate, high
  familyMedicalHistory: text("family_medical_history"),
  smokingStatus: varchar("smoking_status", { length: 20 }), // never, former, current
  alcoholConsumption: varchar("alcohol_consumption", { length: 20 }), // none, occasional, moderate, heavy
  exerciseFrequency: varchar("exercise_frequency", { length: 20 }), // never, rarely, weekly, daily
  
  // Vision Details
  rightEyeSphere: varchar("right_eye_sphere", { length: 10 }),
  rightEyeCylinder: varchar("right_eye_cylinder", { length: 10 }),
  rightEyeAxis: varchar("right_eye_axis", { length: 10 }),
  leftEyeSphere: varchar("left_eye_sphere", { length: 10 }),
  leftEyeCylinder: varchar("left_eye_cylinder", { length: 10 }),
  leftEyeAxis: varchar("left_eye_axis", { length: 10 }),
  pupillaryDistance: varchar("pupillary_distance", { length: 10 }),
  
  // Medical Notes & Follow-up
  doctorNotes: text("doctor_notes"),
  treatmentPlan: text("treatment_plan"),
  followUpDate: date("follow_up_date"),
  medicalAlerts: text("medical_alerts"),
  
  // Portal Access Credentials
  username: varchar("username", { length: 50 }),
  password: varchar("password", { length: 255 }), // Will be hashed
  
  // Additional Identity & Insurance Fields
  nationalId: varchar("national_id", { length: 50 }),
  nisNumber: varchar("nis_number", { length: 50 }),
  
  // Insurance Coupons/Government Benefits
  insuranceCoupons: jsonb("insurance_coupons").$type<Array<{
    couponCode: string;
    serviceType: string;
    amount: number;
    issuedDate: string;
    expiryDate: string;
    status: 'active' | 'used' | 'expired';
    description?: string;
  }>>().default(sql`'[]'::jsonb`),
  
  isActive: boolean("is_active").default(true),
  loyaltyTier: varchar("loyalty_tier", { length: 20 }).default("bronze"),
  loyaltyPoints: integer("loyalty_points").default(0),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical appointments (enhanced appointments)
export const medicalAppointments = pgTable("medical_appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentNumber: varchar("appointment_number", { length: 20 }).unique().notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => staff.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentType: varchar("appointment_type", { length: 50 }).notNull(), // checkup, follow-up, emergency
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled, no-show
  notes: text("notes"),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  nextFollowUp: date("next_follow_up"),
  duration: integer("duration").default(30), // minutes
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  prescriptionNumber: varchar("prescription_number", { length: 20 }).unique().notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => staff.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  storeId: varchar("store_id").references(() => stores.id),
  prescriptionDate: timestamp("prescription_date").defaultNow(),
  prescriptionType: varchar("prescription_type", { length: 50 }).notNull(), // glasses, contact_lenses, medication
  
  // Visual Acuity
  visualAcuityRightEye: varchar("visual_acuity_right_eye", { length: 20 }),
  visualAcuityLeftEye: varchar("visual_acuity_left_eye", { length: 20 }),
  
  // Right Eye Values
  sphereRight: decimal("sphere_right", { precision: 4, scale: 2 }),
  cylinderRight: decimal("cylinder_right", { precision: 4, scale: 2 }),
  axisRight: integer("axis_right"),
  addRight: decimal("add_right", { precision: 4, scale: 2 }),
  
  // Left Eye Values
  sphereLeft: decimal("sphere_left", { precision: 4, scale: 2 }),
  cylinderLeft: decimal("cylinder_left", { precision: 4, scale: 2 }),
  axisLeft: integer("axis_left"),
  addLeft: decimal("add_left", { precision: 4, scale: 2 }),
  
  // Pupillary Distance
  pdDistance: decimal("pd_distance", { precision: 4, scale: 1 }),
  pdNear: decimal("pd_near", { precision: 4, scale: 1 }),
  pdFar: decimal("pd_far", { precision: 4, scale: 1 }),
  
  // Medical Information
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  advice: text("advice"),
  nextFollowUp: date("next_follow_up"),
  
  // Additional Notes and Custom Fields
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  
  // Status and Verification
  status: varchar("status", { length: 20 }).default("active"), // active, filled, expired
  qrCode: varchar("qr_code", { length: 255 }), // QR code for verification
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prescription items (linked products/interventions)
export const prescriptionItems = pgTable("prescription_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  itemType: varchar("item_type", { length: 50 }).notNull(), // product, intervention, medication
  itemName: varchar("item_name", { length: 255 }).notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical interventions/services
export const medicalInterventions = pgTable("medical_interventions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Regular business invoices for retail customers
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 20 }).unique().notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  
  date: timestamp("date").defaultNow(),
  dueDate: date("due_date"),
  
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, paid, overdue, cancelled
  paymentMethod: varchar("payment_method", { length: 20 }), // cash, card, check, digital
  paymentDate: timestamp("payment_date"),
  
  // Coupon redemption fields for government and insurance coupons
  appliedCouponCode: varchar("applied_coupon_code", { length: 50 }),
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"),
  couponType: varchar("coupon_type", { length: 30 }), // government, insurance, promotional
  couponDescription: text("coupon_description"),
  
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice items for regular invoices
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical invoices (enhanced billing)
export const medicalInvoices = pgTable("medical_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 20 }).unique().notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id),
  appointmentId: uuid("appointment_id").references(() => medicalAppointments.id),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  storeId: varchar("store_id").references(() => stores.id),
  
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: date("due_date"),
  
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, partial, paid, overdue
  paymentMethod: varchar("payment_method", { length: 20 }), // cash, card, insurance, check
  paymentDate: timestamp("payment_date"),
  
  // Coupon redemption fields for government and insurance coupons
  appliedCouponCode: varchar("applied_coupon_code", { length: 50 }),
  couponDiscount: decimal("coupon_discount", { precision: 10, scale: 2 }).default("0"),
  couponType: varchar("coupon_type", { length: 30 }), // government, insurance, promotional
  couponDescription: text("coupon_description"),
  
  notes: text("notes"),
  qrCode: varchar("qr_code", { length: 255 }),
  customFields: jsonb("custom_fields"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice items
export const medicalInvoiceItems = pgTable("medical_invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => medicalInvoices.id).notNull(),
  itemType: varchar("item_type", { length: 50 }).notNull(), // product, intervention, consultation
  itemId: uuid("item_id"), // Reference to product, intervention, or service
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient history tracking
export const patientHistory = pgTable("patient_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id),
  recordType: varchar("record_type", { length: 50 }).notNull(), // appointment, prescription, invoice, intervention
  recordId: uuid("record_id").notNull(),
  recordDate: timestamp("record_date").defaultNow(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional data specific to record type
  createdAt: timestamp("created_at").defaultNow(),
});

// Accounting & Financial Tracking Tables

// Account categories for chart of accounts
export const accountCategories = pgTable("account_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // Assets, Liabilities, Equity, Revenue, Expenses
  code: varchar("code").unique().notNull(), // A, L, E, R, X
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chart of Accounts
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountNumber: varchar("account_number").unique().notNull(),
  accountName: varchar("account_name").notNull(),
  categoryId: varchar("category_id").references(() => accountCategories.id).notNull(),
  parentAccountId: varchar("parent_account_id"),
  accountType: varchar("account_type").notNull(), // asset, liability, equity, revenue, expense
  subType: varchar("sub_type"), // current_asset, fixed_asset, current_liability, etc.
  normalBalance: varchar("normal_balance").notNull(), // debit, credit
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// General Ledger Entries
export const generalLedgerEntries = pgTable("general_ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull(), // Links related debits/credits
  accountId: varchar("account_id").references(() => chartOfAccounts.id).notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  postingDate: timestamp("posting_date").defaultNow(),
  description: text("description").notNull(),
  referenceType: varchar("reference_type").notNull(), // invoice, payment, sale, purchase, adjustment
  referenceId: varchar("reference_id").notNull(), // ID of the source record
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default('0'),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default('0'),
  runningBalance: decimal("running_balance", { precision: 15, scale: 2 }).default('0'),
  fiscalYear: integer("fiscal_year").notNull(),
  fiscalPeriod: integer("fiscal_period").notNull(), // 1-12 for months
  isReversed: boolean("is_reversed").default(false),
  reversalTransactionId: varchar("reversal_transaction_id"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Transactions (Enhanced)
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionNumber: varchar("transaction_number").unique().notNull(),
  transactionType: varchar("transaction_type").notNull(), // income, expense, transfer
  sourceType: varchar("source_type").notNull(), // invoice, sale, purchase, appointment, manual
  sourceId: varchar("source_id").notNull(),
  customerId: varchar("customer_id").references(() => customers.id),
  payerId: varchar("payer_id"), // Can be customer, supplier, or internal
  payerName: varchar("payer_name").notNull(),
  payerType: varchar("payer_type").notNull(), // customer, supplier, employee, other
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency").default('USD'),
  paymentMethod: varchar("payment_method").notNull(), // cash, card, check, bank_transfer, digital
  paymentProcessor: varchar("payment_processor"), // stripe, square, paypal, etc.
  processorTransactionId: varchar("processor_transaction_id"),
  bankAccount: varchar("bank_account"), // Account used for transaction
  checkNumber: varchar("check_number"),
  status: varchar("status").default('completed'), // pending, completed, failed, cancelled, refunded
  description: text("description"),
  notes: text("notes"),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).default('0'),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).notNull(), // amount - fees
  transactionDate: timestamp("transaction_date").notNull(),
  processedDate: timestamp("processed_date"),
  reconciledDate: timestamp("reconciled_date"),
  isReconciled: boolean("is_reconciled").default(false),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Cost Tracking
export const productCosts = pgTable("product_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  costType: varchar("cost_type").notNull(), // purchase, landed, average, fifo, lifo
  unitCost: decimal("unit_cost", { precision: 10, scale: 4 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  effectiveDate: timestamp("effective_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profit & Loss Tracking
export const profitLossEntries = pgTable("profit_loss_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryDate: timestamp("entry_date").notNull(),
  entryType: varchar("entry_type").notNull(), // revenue, cogs, expense
  category: varchar("category").notNull(), // sales, services, inventory, operating, other
  subCategory: varchar("sub_category"), // product_sales, appointment_fees, advertising, etc.
  sourceType: varchar("source_type").notNull(), // sale, invoice, purchase, appointment, manual
  sourceId: varchar("source_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  unitAmount: decimal("unit_amount", { precision: 10, scale: 2 }),
  storeId: varchar("store_id").references(() => stores.id),
  customerId: varchar("customer_id").references(() => customers.id),
  productId: varchar("product_id").references(() => products.id),
  staffId: varchar("staff_id").references(() => users.id),
  fiscalYear: integer("fiscal_year").notNull(),
  fiscalPeriod: integer("fiscal_period").notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional type definitions
export type SaleItem = typeof saleItems.$inferSelect;
export type StoreInventory = typeof storeInventory.$inferSelect;

// Enhanced staff and prescription types
export type StaffProfile = typeof staffProfiles.$inferSelect;
export type AppointmentAction = typeof appointmentActions.$inferSelect;
export type AppointmentPrescription = typeof appointmentPrescriptions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;

// Invoice types
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// Medical practice types
export type Doctor = typeof doctors.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type MedicalAppointment = typeof medicalAppointments.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type MedicalIntervention = typeof medicalInterventions.$inferSelect;
export type MedicalInvoice = typeof medicalInvoices.$inferSelect;
export type MedicalInvoiceItem = typeof medicalInvoiceItems.$inferSelect;

// Accounting Types
export type AccountCategory = typeof accountCategories.$inferSelect;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type GeneralLedgerEntry = typeof generalLedgerEntries.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type ProductCost = typeof productCosts.$inferSelect;
export type ProfitLossEntry = typeof profitLossEntries.$inferSelect;

// Insert schemas for accounting
export const insertAccountCategorySchema = createInsertSchema(accountCategories).omit({
  id: true,
  createdAt: true,
});

export const insertChartOfAccountSchema = createInsertSchema(chartOfAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeneralLedgerEntrySchema = createInsertSchema(generalLedgerEntries).omit({
  id: true,
  postingDate: true,
  createdAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  transactionNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductCostSchema = createInsertSchema(productCosts).omit({
  id: true,
  createdAt: true,
});

export const insertProfitLossEntrySchema = createInsertSchema(profitLossEntries).omit({
  id: true,
  createdAt: true,
});

// Insert types for accounting
export type InsertAccountCategory = z.infer<typeof insertAccountCategorySchema>;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountSchema>;
export type InsertGeneralLedgerEntry = z.infer<typeof insertGeneralLedgerEntrySchema>;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type InsertProductCost = z.infer<typeof insertProductCostSchema>;
export type InsertProfitLossEntry = z.infer<typeof insertProfitLossEntrySchema>;
export type PatientHistory = typeof patientHistory.$inferSelect;

// Medical practice insert schemas
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalAppointmentSchema = createInsertSchema(medicalAppointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  appointmentDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  prescriptionDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  axisRight: z.union([z.number(), z.string(), z.null()]).transform((val) => 
    val === null || val === '' ? null : typeof val === 'string' ? parseInt(val) : val
  ).optional(),
  axisLeft: z.union([z.number(), z.string(), z.null()]).transform((val) => 
    val === null || val === '' ? null : typeof val === 'string' ? parseInt(val) : val
  ).optional(),
}).partial();

export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalInterventionSchema = createInsertSchema(medicalInterventions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalInvoiceSchema = createInsertSchema(medicalInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalInvoiceItemSchema = createInsertSchema(medicalInvoiceItems).omit({
  id: true,
  createdAt: true,
});

// Enhanced staff and prescription insert schemas
export const insertStaffProfileSchema = createInsertSchema(staffProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentActionSchema = createInsertSchema(appointmentActions).omit({
  id: true,
  actionDate: true,
});

export const insertAppointmentPrescriptionSchema = createInsertSchema(appointmentPrescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

// Medical practice insert types
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertMedicalAppointment = z.infer<typeof insertMedicalAppointmentSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type InsertMedicalIntervention = z.infer<typeof insertMedicalInterventionSchema>;
export type InsertMedicalInvoice = z.infer<typeof insertMedicalInvoiceSchema>;
export type InsertMedicalInvoiceItem = z.infer<typeof insertMedicalInvoiceItemSchema>;

// Enhanced types
export type InsertStaffProfile = z.infer<typeof insertStaffProfileSchema>;
export type InsertAppointmentAction = z.infer<typeof insertAppointmentActionSchema>;
export type InsertAppointmentPrescription = z.infer<typeof insertAppointmentPrescriptionSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// HR Management Schema
export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffCode: varchar("staff_code", { length: 20 }).unique().notNull(),
  employeeId: varchar("employee_id", { length: 50 }).unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  
  // Employment details
  position: varchar("position", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }),
  storeId: varchar("store_id").references(() => stores.id),
  managerId: uuid("manager_id"),
  
  // Employment dates
  hireDate: date("hire_date").notNull(),
  terminationDate: date("termination_date"),
  
  // Status and access
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, inactive, terminated
  role: varchar("role", { length: 50 }).default("staff").notNull(), // admin, manager, staff, doctor
  permissions: jsonb("permissions").default([]), // Array of permission strings
  
  // Login credentials
  username: varchar("username", { length: 50 }).unique(),
  password: varchar("password", { length: 255 }), // Will be hashed
  
  // Working hours and payroll
  minimumWorkingHours: decimal("minimum_working_hours", { precision: 4, scale: 2 }).default('8.00'), // minimum hours per day
  dailyWorkingHours: decimal("daily_working_hours", { precision: 4, scale: 2 }).default('8.00'), // expected daily hours
  
  // Additional profile fields
  bloodGroup: varchar("blood_group", { length: 5 }), // A+, B+, O+, AB+, etc.
  staffPhoto: varchar("staff_photo", { length: 500 }), // URL to staff photo
  documents: jsonb("documents").default([]), // Array of document objects {name, url, type, uploadDate}
  
  // Emergency contact
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
  
  // Profile
  avatar: varchar("avatar", { length: 500 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  nationality: varchar("nationality", { length: 100 }),
  
  // Custom fields for additional data
  customFields: jsonb("custom_fields").default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance tracking
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id),
  
  // Date and time tracking
  date: date("date").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  
  // Location and method
  checkInMethod: varchar("check_in_method", { length: 20 }).default("manual"), // qr, geolocation, manual
  checkOutMethod: varchar("check_out_method", { length: 20 }).default("manual"),
  checkInLocation: jsonb("check_in_location"), // {lat, lng, address}
  checkOutLocation: jsonb("check_out_location"),
  
  // Status and notes
  status: varchar("status", { length: 20 }).default("present"), // present, absent, late, half_day
  isLate: boolean("is_late").default(false),
  lateMinutes: integer("late_minutes").default(0),
  notes: text("notes"),
  
  // QR code for verification
  qrCode: text("qr_code"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave management
export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaveNumber: varchar("leave_number", { length: 20 }).unique().notNull(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  managerId: uuid("manager_id"),
  
  // Leave details
  leaveType: varchar("leave_type", { length: 50 }).notNull(), // sick, casual, annual, maternity, emergency
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  
  // Request details
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected, cancelled
  appliedDate: timestamp("applied_date").defaultNow(),
  reviewedDate: timestamp("reviewed_date"),
  reviewComments: text("review_comments"),
  
  // Supporting documents
  attachments: jsonb("attachments").default([]), // Array of file URLs
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll system
export const payroll = pgTable("payroll", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollNumber: varchar("payroll_number", { length: 20 }).unique().notNull(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  
  // Pay period
  payPeriod: varchar("pay_period", { length: 20 }).notNull(), // monthly, bi-weekly, weekly
  payMonth: integer("pay_month").notNull(),
  payYear: integer("pay_year").notNull(),
  payDate: date("pay_date"),
  
  // Salary components
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: jsonb("allowances").default({}), // {housing: 1000, transport: 500, etc}
  deductions: jsonb("deductions").default({}), // {tax: 500, insurance: 200, etc}
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  
  // Calculated amounts
  grossSalary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  
  // Attendance impact
  workingDays: integer("working_days").notNull(),
  presentDays: integer("present_days").notNull(),
  absentDays: integer("absent_days").default(0),
  leavesTaken: integer("leaves_taken").default(0),
  
  // Status and processing
  status: varchar("status", { length: 20 }).default("pending"), // pending, processed, paid
  processedBy: uuid("processed_by").references(() => staff.id),
  processedDate: timestamp("processed_date"),
  
  // Payslip details
  payslipGenerated: boolean("payslip_generated").default(false),
  payslipUrl: varchar("payslip_url", { length: 500 }),
  qrCode: text("qr_code"), // QR code for payslip verification
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications system
export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id").references(() => staff.id),
  recipientType: varchar("recipient_type", { length: 20 }).default("staff"), // staff, customer, all
  
  // Notification content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // hr, appointment, inventory, sales, system
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  
  // Delivery and status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  sentAt: timestamp("sent_at").defaultNow(),
  
  // Related data
  relatedType: varchar("related_type", { length: 50 }), // payroll, leave, attendance, appointment
  relatedId: uuid("related_id"),
  relatedData: jsonb("related_data"), // Additional context data
  
  // Delivery channels
  channels: jsonb("channels").default(["app"]), // app, email, sms, whatsapp
  deliveryStatus: jsonb("delivery_status").default({}), // Status per channel
  
  createdAt: timestamp("created_at").defaultNow(),
});

// HR insert schemas
export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationHRSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});

// HR types
export type Staff = typeof staff.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
export type NotificationHR = typeof notificationsTable.$inferSelect;

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type InsertNotificationHR = z.infer<typeof insertNotificationHRSchema>;

// ===== COMPREHENSIVE PATIENT MANAGEMENT SCHEMA =====

// Patient Insurance Information
export const patientInsurance = pgTable("patient_insurance", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  policyNumber: varchar("policy_number", { length: 100 }).notNull(),
  providerName: varchar("provider_name", { length: 200 }).notNull(),
  coverageAmount: decimal("coverage_amount", { precision: 12, scale: 2 }),
  effectiveDate: timestamp("effective_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  groupNumber: varchar("group_number", { length: 100 }),
  memberNumber: varchar("member_number", { length: 100 }),
  copayAmount: decimal("copay_amount", { precision: 6, scale: 2 }),
  deductibleAmount: decimal("deductible_amount", { precision: 8, scale: 2 }),
  isPrimary: boolean("is_primary").default(true),
  isActive: boolean("is_active").default(true),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Patient Coupons System
export const patientCoupons = pgTable("patient_coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  couponCode: varchar("coupon_code", { length: 50 }).unique().notNull(),
  couponType: varchar("coupon_type", { length: 50 }).notNull(), // 'percentage', 'fixed_amount', 'service_discount'
  discountValue: decimal("discount_value", { precision: 8, scale: 2 }).notNull(),
  applicableServices: jsonb("applicable_services"), // Array of service types
  minimumPurchaseAmount: decimal("minimum_purchase_amount", { precision: 8, scale: 2 }),
  maximumDiscountAmount: decimal("maximum_discount_amount", { precision: 8, scale: 2 }),
  issueDate: timestamp("issue_date").defaultNow(),
  expirationDate: timestamp("expiration_date").notNull(),
  redemptionLimit: integer("redemption_limit").default(1), // How many times can be used
  timesRedeemed: integer("times_redeemed").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by", { length: 100 }),
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coupon Redemption Audit Trail
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull(),
  patientId: uuid("patient_id").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // 'appointment', 'lab_test', 'pharmacy', 'optical', 'invoice'
  transactionId: uuid("transaction_id").notNull(), // Reference to the specific transaction
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  redemptionDate: timestamp("redemption_date").defaultNow(),
  staffUserId: varchar("staff_user_id", { length: 100 }),
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow()
});

// Patient Payment History
export const patientPayments = pgTable("patient_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(),
  transactionId: uuid("transaction_id").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("completed"),
  notes: text("notes"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow()
});

// Enhanced Patient Demographics (extending existing patients table concept)
export const comprehensivePatients = pgTable("comprehensive_patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Basic Demographics  
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: varchar("gender", { length: 20 }),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  alternatePhone: varchar("alternate_phone", { length: 20 }),
  
  // Address Information
  streetAddress: varchar("street_address", { length: 200 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("USA"),
  
  // Emergency Contact
  emergencyContactName: varchar("emergency_contact_name", { length: 200 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 50 }),
  
  // Medical Information
  bloodType: varchar("blood_type", { length: 5 }),
  allergies: jsonb("allergies"), // Array of allergy information
  medications: jsonb("medications"), // Current medications
  medicalHistory: jsonb("medical_history"), // Past medical conditions
  
  // Administrative
  patientCode: varchar("patient_code", { length: 50 }).unique(),
  preferredLanguage: varchar("preferred_language", { length: 50 }).default("English"),
  communicationPreferences: jsonb("communication_preferences"), // Email, SMS, Phone preferences
  isActive: boolean("is_active").default(true),
  registrationDate: timestamp("registration_date").defaultNow(),
  lastVisitDate: timestamp("last_visit_date"),
  
  // Tracking
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Create Zod schemas for new tables
export const insertPatientInsuranceSchema = createInsertSchema(patientInsurance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientCouponSchema = createInsertSchema(patientCoupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponRedemptionSchema = createInsertSchema(couponRedemptions).omit({
  id: true,
  createdAt: true,
});

export const insertPatientPaymentSchema = createInsertSchema(patientPayments).omit({
  id: true,
  createdAt: true,
});

export const insertComprehensivePatientSchema = createInsertSchema(comprehensivePatients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New types
export type PatientInsurance = typeof patientInsurance.$inferSelect;
export type InsertPatientInsurance = z.infer<typeof insertPatientInsuranceSchema>;

export type PatientCoupon = typeof patientCoupons.$inferSelect;
export type InsertPatientCoupon = z.infer<typeof insertPatientCouponSchema>;

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type InsertCouponRedemption = z.infer<typeof insertCouponRedemptionSchema>;

export type PatientPayment = typeof patientPayments.$inferSelect;
export type InsertPatientPayment = z.infer<typeof insertPatientPaymentSchema>;

export type ComprehensivePatient = typeof comprehensivePatients.$inferSelect;
export type InsertComprehensivePatient = z.infer<typeof insertComprehensivePatientSchema>;
