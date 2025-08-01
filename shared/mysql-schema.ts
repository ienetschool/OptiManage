import { sql, relations } from 'drizzle-orm';
import {
  index,
  json,
  mysqlTable,
  timestamp,
  varchar,
  text,
  int,
  decimal,
  boolean,
  date,
  char,
} from "drizzle-orm/mysql-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 50 }).default('staff'), // admin, manager, staff
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Stores
export const stores = mysqlTable("stores", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  managerId: varchar("manager_id", { length: 36 }),
  isActive: boolean("is_active").default(true),
  timezone: varchar("timezone", { length: 50 }).default('America/New_York'),
  openingHours: text("opening_hours"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Categories
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers
export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  contactPerson: varchar("contact_person", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).unique(),
  categoryId: varchar("category_id", { length: 36 }),
  supplierId: varchar("supplier_id", { length: 36 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  brand: varchar("brand", { length: 255 }),
  model: varchar("model", { length: 255 }),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Store Inventory
export const storeInventory = mysqlTable("store_inventory", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  storeId: varchar("store_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  quantity: int("quantity").default(0),
  minStock: int("min_stock").default(0),
  maxStock: int("max_stock").default(100),
  location: varchar("location", { length: 255 }),
  lastRestocked: timestamp("last_restocked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Customers (Enhanced for medical practice)
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insuranceNumber: varchar("insurance_number", { length: 100 }),
  notes: text("notes"),
  loyaltyPoints: int("loyalty_points").default(0),
  preferredStoreId: varchar("preferred_store_id", { length: 36 }),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Patients (Medical records)
export const patients = mysqlTable("patients", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  patientCode: varchar("patient_code", { length: 50 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  address: text("address"),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 100 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insuranceNumber: varchar("insurance_number", { length: 100 }),
  bloodType: varchar("blood_type", { length: 5 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  currentMedications: text("current_medications"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Doctors
export const doctors = mysqlTable("doctors", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  licenseNumber: varchar("license_number", { length: 100 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  specialization: varchar("specialization", { length: 255 }),
  qualification: text("qualification"),
  experience: int("experience"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  schedule: json("schedule"),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Medical Appointments
export const medicalAppointments = mysqlTable("medical_appointments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  appointmentNumber: varchar("appointment_number", { length: 50 }).unique().notNull(),
  patientId: varchar("patient_id", { length: 36 }).notNull(),
  doctorId: varchar("doctor_id", { length: 36 }).notNull(),
  storeId: varchar("store_id", { length: 36 }).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: int("duration").default(30),
  appointmentType: varchar("appointment_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default('scheduled'),
  chiefComplaint: text("chief_complaint"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  prescriptions: json("prescriptions"),
  followUpDate: date("follow_up_date"),
  notes: text("notes"),
  fee: decimal("fee", { precision: 10, scale: 2 }),
  isPaid: boolean("is_paid").default(false),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Appointments (General appointments system)
export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  patientId: varchar("patient_id", { length: 36 }).notNull(),
  storeId: varchar("store_id", { length: 36 }).notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: int("duration").default(30),
  status: varchar("status", { length: 50 }).default('scheduled'),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Prescriptions
export const prescriptions = mysqlTable("prescriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  prescriptionNumber: varchar("prescription_number", { length: 50 }).unique().notNull(),
  patientId: varchar("patient_id", { length: 36 }).notNull(),
  doctorId: varchar("doctor_id", { length: 36 }).notNull(),
  appointmentId: varchar("appointment_id", { length: 36 }),
  prescriptionDate: date("prescription_date").notNull(),
  validUntil: date("valid_until"),
  instructions: text("instructions"),
  status: varchar("status", { length: 50 }).default('active'),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Prescription Items
export const prescriptionItems = mysqlTable("prescription_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  prescriptionId: varchar("prescription_id", { length: 36 }).notNull(),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  quantity: int("quantity"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales
export const sales = mysqlTable("sales", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  storeId: varchar("store_id", { length: 36 }).notNull(),
  customerId: varchar("customer_id", { length: 36 }),
  userId: varchar("user_id", { length: 36 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default('0.00'),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0.00'),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default('pending'),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sale Items
export const saleItems = mysqlTable("sale_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  saleId: varchar("sale_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff Management
export const staff = mysqlTable("staff", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  employeeId: varchar("employee_id", { length: 50 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  storeId: varchar("store_id", { length: 36 }),
  hireDate: date("hire_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// System Settings
export const systemSettings = mysqlTable("system_settings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value"),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  isPublic: boolean("is_public").default(false),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default('info'),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Invoices
export const medicalInvoices = mysqlTable("medical_invoices", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  patientId: varchar("patient_id", { length: 36 }).notNull(),
  appointmentId: varchar("appointment_id", { length: 36 }),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default('0.00'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default('pending'),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Medical Invoice Items
export const medicalInvoiceItems = mysqlTable("medical_invoice_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  invoiceId: varchar("invoice_id", { length: 36 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Templates
export const emailTemplates = mysqlTable("email_templates", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 100 }),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Custom Fields Configuration
export const customFieldsConfig = mysqlTable("custom_fields_config", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  fieldName: varchar("field_name", { length: 255 }).notNull(),
  fieldType: varchar("field_type", { length: 50 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  options: json("options"),
  isRequired: boolean("is_required").default(false),
  isActive: boolean("is_active").default(true),
  order: int("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient History
export const patientHistory = mysqlTable("patient_history", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  patientId: varchar("patient_id", { length: 36 }).notNull(),
  visitDate: date("visit_date").notNull(),
  chiefComplaint: text("chief_complaint"),
  vitalSigns: json("vital_signs"),
  examination: text("examination"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpInstructions: text("follow_up_instructions"),
  doctorId: varchar("doctor_id", { length: 36 }),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication Log
export const communicationLog = mysqlTable("communication_log", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  patientId: varchar("patient_id", { length: 36 }),
  customerId: varchar("customer_id", { length: 36 }),
  type: varchar("type", { length: 50 }).notNull(), // email, sms, call, etc.
  subject: varchar("subject", { length: 500 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).default('sent'),
  sentBy: varchar("sent_by", { length: 36 }),
  sentAt: timestamp("sent_at").defaultNow(),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Interventions
export const medicalInterventions = mysqlTable("medical_interventions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  duration: int("duration"), // in minutes
  cost: decimal("cost", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Payroll
export const payroll = mysqlTable("payroll", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  staffId: varchar("staff_id", { length: 36 }).notNull(),
  payPeriodStart: date("pay_period_start").notNull(),
  payPeriodEnd: date("pay_period_end").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default('0.00'),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default('0.00'),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default('0.00'),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default('pending'),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance
export const attendance = mysqlTable("attendance", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  staffId: varchar("staff_id", { length: 36 }).notNull(),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default('present'),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leave Requests
export const leaveRequests = mysqlTable("leave_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  staffId: varchar("staff_id", { length: 36 }).notNull(),
  leaveType: varchar("leave_type", { length: 100 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default('pending'),
  approvedBy: varchar("approved_by", { length: 36 }),
  approvedAt: timestamp("approved_at"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
  sales: many(sales),
  notifications: many(notifications),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  manager: one(users, {
    fields: [stores.managerId],
    references: [users.id],
  }),
  inventory: many(storeInventory),
  sales: many(sales),
  appointments: many(appointments),
  medicalAppointments: many(medicalAppointments),
  staff: many(staff),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  preferredStore: one(stores, {
    fields: [customers.preferredStoreId],
    references: [stores.id],
  }),
  sales: many(sales),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(medicalAppointments),
  prescriptions: many(prescriptions),
  history: many(patientHistory),
  invoices: many(medicalInvoices),
  communications: many(communicationLog),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  appointments: many(medicalAppointments),
  prescriptions: many(prescriptions),
}));

export const medicalAppointmentsRelations = relations(medicalAppointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [medicalAppointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [medicalAppointments.doctorId],
    references: [doctors.id],
  }),
  store: one(stores, {
    fields: [medicalAppointments.storeId],
    references: [stores.id],
  }),
  invoices: many(medicalInvoices),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  store: one(stores, {
    fields: [appointments.storeId],
    references: [stores.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [prescriptions.doctorId],
    references: [doctors.id],
  }),
  appointment: one(medicalAppointments, {
    fields: [prescriptions.appointmentId],
    references: [medicalAppointments.id],
  }),
  items: many(prescriptionItems),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionItems.prescriptionId],
    references: [prescriptions.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
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

export const storeInventoryRelations = relations(storeInventory, ({ one }) => ({
  store: one(stores, {
    fields: [storeInventory.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [storeInventory.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  store: one(stores, {
    fields: [sales.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  store: one(stores, {
    fields: [staff.storeId],
    references: [stores.id],
  }),
  payroll: many(payroll),
  attendance: many(attendance),
  leaveRequests: many(leaveRequests),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const medicalInvoicesRelations = relations(medicalInvoices, ({ one, many }) => ({
  patient: one(patients, {
    fields: [medicalInvoices.patientId],
    references: [patients.id],
  }),
  appointment: one(medicalAppointments, {
    fields: [medicalInvoices.appointmentId],
    references: [medicalAppointments.id],
  }),
  items: many(medicalInvoiceItems),
}));

export const medicalInvoiceItemsRelations = relations(medicalInvoiceItems, ({ one }) => ({
  invoice: one(medicalInvoices, {
    fields: [medicalInvoiceItems.invoiceId],
    references: [medicalInvoices.id],
  }),
}));

export const patientHistoryRelations = relations(patientHistory, ({ one }) => ({
  patient: one(patients, {
    fields: [patientHistory.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [patientHistory.doctorId],
    references: [doctors.id],
  }),
}));

export const communicationLogRelations = relations(communicationLog, ({ one }) => ({
  patient: one(patients, {
    fields: [communicationLog.patientId],
    references: [patients.id],
  }),
  customer: one(customers, {
    fields: [communicationLog.customerId],
    references: [customers.id],
  }),
  sentByUser: one(users, {
    fields: [communicationLog.sentBy],
    references: [users.id],
  }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  staff: one(staff, {
    fields: [payroll.staffId],
    references: [staff.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  staff: one(staff, {
    fields: [attendance.staffId],
    references: [staff.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  staff: one(staff, {
    fields: [leaveRequests.staffId],
    references: [staff.id],
  }),
  approver: one(users, {
    fields: [leaveRequests.approvedBy],
    references: [users.id],
  }),
}));

// Zod schemas for form validation
export const insertUserSchema = createInsertSchema(users);
export const insertStoreSchema = createInsertSchema(stores);
export const insertProductSchema = createInsertSchema(products);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertPatientSchema = createInsertSchema(patients);
export const insertDoctorSchema = createInsertSchema(doctors);
export const insertMedicalAppointmentSchema = createInsertSchema(medicalAppointments);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertPrescriptionSchema = createInsertSchema(prescriptions);
export const insertSaleSchema = createInsertSchema(sales);
export const insertStaffSchema = createInsertSchema(staff);
export const insertNotificationSchema = createInsertSchema(notifications);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type MedicalAppointment = typeof medicalAppointments.$inferSelect;
export type InsertMedicalAppointment = z.infer<typeof insertMedicalAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;