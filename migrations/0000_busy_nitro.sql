CREATE TABLE "account_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "account_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "appointment_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" varchar NOT NULL,
	"doctor_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"notes" text,
	"action_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_prescriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" varchar NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" varchar NOT NULL,
	"prescription_code" varchar NOT NULL,
	"medications" jsonb NOT NULL,
	"diagnosis" text,
	"symptoms" text,
	"treatment_plan" text,
	"follow_up_date" date,
	"status" varchar DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "appointment_prescriptions_prescription_code_unique" UNIQUE("prescription_code")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" varchar NOT NULL,
	"customer_id" varchar,
	"store_id" varchar NOT NULL,
	"staff_id" varchar,
	"assigned_doctor_id" varchar,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"service" varchar NOT NULL,
	"appointment_fee" numeric(10, 2),
	"payment_status" varchar DEFAULT 'pending',
	"payment_method" varchar,
	"payment_date" timestamp,
	"status" varchar DEFAULT 'scheduled',
	"priority" varchar DEFAULT 'normal',
	"notes" text,
	"doctor_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"store_id" varchar,
	"date" date NOT NULL,
	"check_in_time" timestamp,
	"check_out_time" timestamp,
	"total_hours" numeric(5, 2),
	"check_in_method" varchar(20) DEFAULT 'manual',
	"check_out_method" varchar(20) DEFAULT 'manual',
	"check_in_location" jsonb,
	"check_out_location" jsonb,
	"status" varchar(20) DEFAULT 'present',
	"is_late" boolean DEFAULT false,
	"late_minutes" integer DEFAULT 0,
	"notes" text,
	"qr_code" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_number" varchar NOT NULL,
	"account_name" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"parent_account_id" varchar,
	"account_type" varchar NOT NULL,
	"sub_type" varchar,
	"normal_balance" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chart_of_accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "communication_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
	"type" varchar NOT NULL,
	"recipient" varchar NOT NULL,
	"subject" varchar,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'sent',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_fields_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"field_name" varchar NOT NULL,
	"field_type" varchar NOT NULL,
	"field_options" jsonb,
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"date_of_birth" date,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"loyalty_points" integer DEFAULT 0,
	"loyalty_tier" varchar DEFAULT 'Bronze',
	"notes" text,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"doctor_code" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"specialization" varchar(100),
	"license_number" varchar(50),
	"phone" varchar(20),
	"email" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "doctors_doctor_code_unique" UNIQUE("doctor_code")
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"body" text NOT NULL,
	"template_type" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "general_ledger_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"posting_date" timestamp DEFAULT now(),
	"description" text NOT NULL,
	"reference_type" varchar NOT NULL,
	"reference_id" varchar NOT NULL,
	"debit_amount" numeric(15, 2) DEFAULT '0',
	"credit_amount" numeric(15, 2) DEFAULT '0',
	"running_balance" numeric(15, 2) DEFAULT '0',
	"fiscal_year" integer NOT NULL,
	"fiscal_period" integer NOT NULL,
	"is_reversed" boolean DEFAULT false,
	"reversal_transaction_id" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" varchar,
	"product_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(20) NOT NULL,
	"customer_id" varchar,
	"store_id" varchar NOT NULL,
	"date" timestamp DEFAULT now(),
	"due_date" date,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"payment_method" varchar(20),
	"payment_date" timestamp,
	"applied_coupon_code" varchar(50),
	"coupon_discount" numeric(10, 2) DEFAULT '0',
	"coupon_type" varchar(30),
	"coupon_description" text,
	"notes" text,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leave_number" varchar(20) NOT NULL,
	"staff_id" uuid NOT NULL,
	"manager_id" uuid,
	"leave_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"applied_date" timestamp DEFAULT now(),
	"reviewed_date" timestamp,
	"review_comments" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leave_requests_leave_number_unique" UNIQUE("leave_number")
);
--> statement-breakpoint
CREATE TABLE "medical_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_number" varchar(20) NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"store_id" varchar,
	"appointment_date" timestamp NOT NULL,
	"appointment_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled',
	"notes" text,
	"symptoms" text,
	"diagnosis" text,
	"treatment" text,
	"next_follow_up" date,
	"duration" integer DEFAULT 30,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "medical_appointments_appointment_number_unique" UNIQUE("appointment_number")
);
--> statement-breakpoint
CREATE TABLE "medical_interventions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "medical_interventions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "medical_invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"item_type" varchar(50) NOT NULL,
	"item_id" uuid,
	"item_name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(20) NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"appointment_id" uuid,
	"prescription_id" uuid,
	"store_id" varchar,
	"invoice_date" timestamp DEFAULT now(),
	"due_date" date,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending',
	"payment_method" varchar(20),
	"payment_date" timestamp,
	"applied_coupon_code" varchar(50),
	"coupon_discount" numeric(10, 2) DEFAULT '0',
	"coupon_type" varchar(30),
	"coupon_description" text,
	"notes" text,
	"qr_code" varchar(255),
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "medical_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid,
	"recipient_type" varchar(20) DEFAULT 'staff',
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'normal',
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"sent_at" timestamp DEFAULT now(),
	"related_type" varchar(50),
	"related_id" uuid,
	"related_data" jsonb,
	"channels" jsonb DEFAULT '["app"]'::jsonb,
	"delivery_status" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patient_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"record_type" varchar(50) NOT NULL,
	"record_id" uuid NOT NULL,
	"record_date" timestamp DEFAULT now(),
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_code" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date,
	"gender" varchar(10),
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"emergency_contact" varchar(100),
	"emergency_phone" varchar(20),
	"blood_group" varchar(5),
	"allergies" text,
	"medical_history" text,
	"insurance_provider" varchar(100),
	"insurance_number" varchar(50),
	"current_medications" text,
	"previous_eye_conditions" text,
	"last_eye_exam_date" date,
	"current_prescription" varchar(200),
	"risk_factors" varchar(20) DEFAULT 'low',
	"family_medical_history" text,
	"smoking_status" varchar(20),
	"alcohol_consumption" varchar(20),
	"exercise_frequency" varchar(20),
	"right_eye_sphere" varchar(10),
	"right_eye_cylinder" varchar(10),
	"right_eye_axis" varchar(10),
	"left_eye_sphere" varchar(10),
	"left_eye_cylinder" varchar(10),
	"left_eye_axis" varchar(10),
	"pupillary_distance" varchar(10),
	"doctor_notes" text,
	"treatment_plan" text,
	"follow_up_date" date,
	"medical_alerts" text,
	"username" varchar(50),
	"password" varchar(255),
	"national_id" varchar(50),
	"nis_number" varchar(50),
	"insurance_coupons" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"loyalty_tier" varchar(20) DEFAULT 'bronze',
	"loyalty_points" integer DEFAULT 0,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_patient_code_unique" UNIQUE("patient_code")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_number" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"source_type" varchar NOT NULL,
	"source_id" varchar NOT NULL,
	"customer_id" varchar,
	"payer_id" varchar,
	"payer_name" varchar NOT NULL,
	"payer_type" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"payment_method" varchar NOT NULL,
	"payment_processor" varchar,
	"processor_transaction_id" varchar,
	"bank_account" varchar,
	"check_number" varchar,
	"status" varchar DEFAULT 'completed',
	"description" text,
	"notes" text,
	"fee_amount" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(15, 2) NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"processed_date" timestamp,
	"reconciled_date" timestamp,
	"is_reconciled" boolean DEFAULT false,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_number" varchar(20) NOT NULL,
	"staff_id" uuid NOT NULL,
	"pay_period" varchar(20) NOT NULL,
	"pay_month" integer NOT NULL,
	"pay_year" integer NOT NULL,
	"pay_date" date,
	"basic_salary" numeric(10, 2) NOT NULL,
	"allowances" jsonb DEFAULT '{}'::jsonb,
	"deductions" jsonb DEFAULT '{}'::jsonb,
	"overtime" numeric(10, 2) DEFAULT '0',
	"bonus" numeric(10, 2) DEFAULT '0',
	"gross_salary" numeric(10, 2) NOT NULL,
	"total_deductions" numeric(10, 2) DEFAULT '0',
	"net_salary" numeric(10, 2) NOT NULL,
	"working_days" integer NOT NULL,
	"present_days" integer NOT NULL,
	"absent_days" integer DEFAULT 0,
	"leaves_taken" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'pending',
	"processed_by" uuid,
	"processed_date" timestamp,
	"payslip_generated" boolean DEFAULT false,
	"payslip_url" varchar(500),
	"qr_code" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payroll_payroll_number_unique" UNIQUE("payroll_number")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_id" uuid NOT NULL,
	"product_id" varchar,
	"item_type" varchar(50) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(10, 2),
	"total_price" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescription_number" varchar(20) NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"appointment_id" varchar,
	"store_id" varchar,
	"prescription_date" timestamp DEFAULT now(),
	"prescription_type" varchar(50) NOT NULL,
	"visual_acuity_right_eye" varchar(20),
	"visual_acuity_left_eye" varchar(20),
	"sphere_right" numeric(4, 2),
	"cylinder_right" numeric(4, 2),
	"axis_right" integer,
	"add_right" numeric(4, 2),
	"sphere_left" numeric(4, 2),
	"cylinder_left" numeric(4, 2),
	"axis_left" integer,
	"add_left" numeric(4, 2),
	"pd_distance" numeric(4, 1),
	"pd_near" numeric(4, 1),
	"pd_far" numeric(4, 1),
	"diagnosis" text,
	"treatment" text,
	"advice" text,
	"next_follow_up" date,
	"notes" text,
	"custom_fields" jsonb,
	"status" varchar(20) DEFAULT 'active',
	"qr_code" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "prescriptions_prescription_number_unique" UNIQUE("prescription_number")
);
--> statement-breakpoint
CREATE TABLE "product_costs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"store_id" varchar NOT NULL,
	"cost_type" varchar NOT NULL,
	"unit_cost" numeric(10, 4) NOT NULL,
	"quantity" integer NOT NULL,
	"total_cost" numeric(15, 2) NOT NULL,
	"purchase_order_id" varchar,
	"supplier_id" varchar,
	"effective_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"sku" varchar NOT NULL,
	"barcode" varchar,
	"category_id" varchar,
	"supplier_id" varchar,
	"price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2),
	"product_type" varchar DEFAULT 'frames',
	"reorder_level" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "profit_loss_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_date" timestamp NOT NULL,
	"entry_type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"sub_category" varchar,
	"source_type" varchar NOT NULL,
	"source_id" varchar NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"quantity" integer DEFAULT 1,
	"unit_amount" numeric(10, 2),
	"store_id" varchar,
	"customer_id" varchar,
	"product_id" varchar,
	"staff_id" varchar,
	"fiscal_year" integer NOT NULL,
	"fiscal_period" integer NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10, 2) NOT NULL,
	"discount" numeric(5, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"received_quantity" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_number" varchar NOT NULL,
	"supplier_id" varchar NOT NULL,
	"store_id" varchar NOT NULL,
	"order_date" timestamp DEFAULT now(),
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"status" varchar DEFAULT 'pending',
	"subtotal" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"payment_status" varchar DEFAULT 'pending',
	"payment_method" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_orders_purchase_order_number_unique" UNIQUE("purchase_order_number")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_name" varchar NOT NULL,
	"module" varchar NOT NULL,
	"permissions" jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" varchar NOT NULL,
	"customer_id" varchar,
	"staff_id" varchar NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_status" varchar DEFAULT 'completed',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_code" varchar(20) NOT NULL,
	"employee_id" varchar(50),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"position" varchar(100) NOT NULL,
	"department" varchar(100),
	"store_id" varchar,
	"manager_id" uuid,
	"hire_date" date NOT NULL,
	"termination_date" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"role" varchar(50) DEFAULT 'staff' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"username" varchar(50),
	"password" varchar(255),
	"minimum_working_hours" numeric(4, 2) DEFAULT '8.00',
	"daily_working_hours" numeric(4, 2) DEFAULT '8.00',
	"blood_group" varchar(5),
	"staff_photo" varchar(500),
	"documents" jsonb DEFAULT '[]'::jsonb,
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"emergency_contact_relation" varchar(100),
	"avatar" varchar(500),
	"date_of_birth" date,
	"gender" varchar(10),
	"nationality" varchar(100),
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_staff_code_unique" UNIQUE("staff_code"),
	CONSTRAINT "staff_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "staff_email_unique" UNIQUE("email"),
	CONSTRAINT "staff_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "staff_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"staff_code" varchar NOT NULL,
	"job_title" varchar NOT NULL,
	"department" varchar NOT NULL,
	"specialization" varchar,
	"license_number" varchar,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"work_schedule" jsonb,
	"salary" numeric(12, 2),
	"hire_date" date NOT NULL,
	"status" varchar DEFAULT 'active',
	"supervisor_id" varchar,
	"emergency_contact" jsonb,
	"qualifications" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_profiles_staff_code_unique" UNIQUE("staff_code")
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"movement_type" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"previous_quantity" integer NOT NULL,
	"new_quantity" integer NOT NULL,
	"reference" varchar,
	"reference_type" varchar,
	"reason" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "store_inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0,
	"min_stock" integer DEFAULT 0,
	"max_stock" integer DEFAULT 100,
	"location" varchar,
	"last_restocked" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"address" text NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar NOT NULL,
	"zip_code" varchar NOT NULL,
	"phone" varchar,
	"email" varchar,
	"manager_id" varchar,
	"is_active" boolean DEFAULT true,
	"timezone" varchar DEFAULT 'America/New_York',
	"opening_hours" text,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"contact_person" varchar,
	"email" varchar,
	"phone" varchar,
	"address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar NOT NULL,
	"key" varchar NOT NULL,
	"value" text,
	"is_encrypted" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"username" varchar,
	"password_hash" varchar,
	"role" varchar DEFAULT 'staff',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "appointment_actions" ADD CONSTRAINT "appointment_actions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_actions" ADD CONSTRAINT "appointment_actions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_prescriptions" ADD CONSTRAINT "appointment_prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_prescriptions" ADD CONSTRAINT "appointment_prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_prescriptions" ADD CONSTRAINT "appointment_prescriptions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_doctor_id_users_id_fk" FOREIGN KEY ("assigned_doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_category_id_account_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."account_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "general_ledger_entries" ADD CONSTRAINT "general_ledger_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_appointments" ADD CONSTRAINT "medical_appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_appointments" ADD CONSTRAINT "medical_appointments_doctor_id_staff_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_appointments" ADD CONSTRAINT "medical_appointments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoice_items" ADD CONSTRAINT "medical_invoice_items_invoice_id_medical_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."medical_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_appointment_id_medical_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."medical_appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_invoices" ADD CONSTRAINT "medical_invoices_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_staff_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_history" ADD CONSTRAINT "patient_history_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_history" ADD CONSTRAINT "patient_history_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_processed_by_staff_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_staff_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_costs" ADD CONSTRAINT "product_costs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_costs" ADD CONSTRAINT "product_costs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_costs" ADD CONSTRAINT "product_costs_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_costs" ADD CONSTRAINT "product_costs_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_loss_entries" ADD CONSTRAINT "profit_loss_entries_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_loss_entries" ADD CONSTRAINT "profit_loss_entries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_loss_entries" ADD CONSTRAINT "profit_loss_entries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_loss_entries" ADD CONSTRAINT "profit_loss_entries_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_loss_entries" ADD CONSTRAINT "profit_loss_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_inventory" ADD CONSTRAINT "store_inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");