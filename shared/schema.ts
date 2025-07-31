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
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  role: varchar("role").default('staff'), // admin, manager, staff
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
  categoryId: varchar("category_id").references(() => categories.id),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
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
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  storeId: varchar("store_id").references(() => stores.id).notNull(),
  staffId: varchar("staff_id").references(() => users.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(60), // minutes
  service: varchar("service").notNull(),
  status: varchar("status").default('scheduled'), // scheduled, completed, cancelled, no-show
  notes: text("notes"),
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
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
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

// Medical practice insert types
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertMedicalAppointment = z.infer<typeof insertMedicalAppointmentSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type InsertMedicalIntervention = z.infer<typeof insertMedicalInterventionSchema>;
export type InsertMedicalInvoice = z.infer<typeof insertMedicalInvoiceSchema>;
export type InsertMedicalInvoiceItem = z.infer<typeof insertMedicalInvoiceItemSchema>;

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

// Patients table (enhanced customers for medical context)
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
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
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
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => medicalAppointments.id),
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

// Additional type definitions
export type SaleItem = typeof saleItems.$inferSelect;
export type StoreInventory = typeof storeInventory.$inferSelect;

// Medical practice types
export type Doctor = typeof doctors.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type MedicalAppointment = typeof medicalAppointments.$inferSelect;
export type Prescription = typeof prescriptions.$inferSelect;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type MedicalIntervention = typeof medicalInterventions.$inferSelect;
export type MedicalInvoice = typeof medicalInvoices.$inferSelect;
export type MedicalInvoiceItem = typeof medicalInvoiceItems.$inferSelect;
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
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

// Medical practice insert types
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertMedicalAppointment = z.infer<typeof insertMedicalAppointmentSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type InsertMedicalIntervention = z.infer<typeof insertMedicalInterventionSchema>;
export type InsertMedicalInvoice = z.infer<typeof insertMedicalInvoiceSchema>;
export type InsertMedicalInvoiceItem = z.infer<typeof insertMedicalInvoiceItemSchema>;
