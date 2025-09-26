CREATE TABLE `appointments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_id` varchar(36) NOT NULL,
	`store_id` varchar(36) NOT NULL,
	`service` varchar(255) NOT NULL,
	`appointment_date` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`status` varchar(50) DEFAULT 'scheduled',
	`notes` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`staff_id` varchar(36) NOT NULL,
	`date` date NOT NULL,
	`check_in` timestamp,
	`check_out` timestamp,
	`break_start` timestamp,
	`break_end` timestamp,
	`total_hours` decimal(5,2),
	`status` varchar(50) DEFAULT 'present',
	`notes` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_log` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_id` varchar(36),
	`customer_id` varchar(36),
	`type` varchar(50) NOT NULL,
	`subject` varchar(500),
	`message` text,
	`status` varchar(50) DEFAULT 'sent',
	`sent_by` varchar(36),
	`sent_at` timestamp DEFAULT (now()),
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `communication_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_fields_config` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`table_name` varchar(100) NOT NULL,
	`field_name` varchar(255) NOT NULL,
	`field_type` varchar(50) NOT NULL,
	`label` varchar(255) NOT NULL,
	`options` json,
	`is_required` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `custom_fields_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`address` text,
	`date_of_birth` date,
	`emergency_contact` varchar(255),
	`emergency_phone` varchar(20),
	`insurance_provider` varchar(255),
	`insurance_number` varchar(100),
	`notes` text,
	`loyalty_points` int DEFAULT 0,
	`preferred_store_id` varchar(36),
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`specs_order_id` varchar(36) NOT NULL,
	`patient_id` varchar(36) NOT NULL,
	`store_id` varchar(36) NOT NULL,
	`delivery_method` varchar(30) NOT NULL,
	`delivery_address` text,
	`recipient_name` varchar(255),
	`recipient_phone` varchar(20),
	`status` varchar(30) DEFAULT 'ready',
	`tracking_number` varchar(100),
	`courier_service` varchar(100),
	`ready_date` timestamp DEFAULT (now()),
	`scheduled_date` date,
	`delivered_date` timestamp,
	`delivery_notes` text,
	`customer_feedback` text,
	`delivery_rating` int,
	`final_quality_check` boolean DEFAULT false,
	`final_check_by` varchar(36),
	`final_check_date` timestamp,
	`final_check_notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`license_number` varchar(100) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`specialization` varchar(255),
	`qualification` text,
	`experience` int,
	`consultation_fee` decimal(10,2),
	`schedule` json,
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_license_number_unique` UNIQUE(`license_number`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`type` varchar(100),
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`staff_id` varchar(36) NOT NULL,
	`leave_type` varchar(100) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`reason` text,
	`status` varchar(50) DEFAULT 'pending',
	`approved_by` varchar(36),
	`approved_at` timestamp,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lens_cutting_tasks` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`specs_order_id` varchar(36) NOT NULL,
	`assigned_to_fitter_id` varchar(36),
	`assigned_by_user_id` varchar(36) NOT NULL,
	`task_type` varchar(50) DEFAULT 'lens_cutting',
	`frame_size` varchar(100),
	`special_instructions` text,
	`estimated_time` int,
	`status` varchar(30) DEFAULT 'assigned',
	`progress` int DEFAULT 0,
	`assigned_date` timestamp DEFAULT (now()),
	`started_date` timestamp,
	`completed_date` timestamp,
	`deadline` timestamp,
	`work_remarks` text,
	`quality_check_notes` text,
	`work_photos` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lens_cutting_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lens_prescriptions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_id` varchar(36) NOT NULL,
	`doctor_id` varchar(36) NOT NULL,
	`prescription_date` date NOT NULL,
	`right_eye_sph` decimal(4,2),
	`right_eye_cyl` decimal(4,2),
	`right_eye_axis` int,
	`right_eye_add` decimal(3,2),
	`left_eye_sph` decimal(4,2),
	`left_eye_cyl` decimal(4,2),
	`left_eye_axis` int,
	`left_eye_add` decimal(3,2),
	`pupillary_distance` decimal(4,1),
	`lens_type` varchar(50) NOT NULL,
	`lens_material` varchar(50) NOT NULL,
	`frame_recommendation` text,
	`coatings` text,
	`tints` varchar(100),
	`special_instructions` text,
	`status` varchar(30) DEFAULT 'prescribed',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lens_prescriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_appointments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`appointment_number` varchar(50) NOT NULL,
	`patient_id` varchar(36) NOT NULL,
	`doctor_id` varchar(36) NOT NULL,
	`store_id` varchar(36) NOT NULL,
	`appointment_date` date NOT NULL,
	`duration` int DEFAULT 30,
	`appointment_type` varchar(100),
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `medical_appointments_appointment_number_unique` UNIQUE(`appointment_number`)
);
--> statement-breakpoint
CREATE TABLE `medical_interventions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`duration` int,
	`cost` decimal(10,2),
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_invoice_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`invoice_id` varchar(36) NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int DEFAULT 1,
	`unit_price` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `medical_invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_invoices` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`invoice_number` varchar(50) NOT NULL,
	`patient_id` varchar(36) NOT NULL,
	`appointment_id` varchar(36),
	`issue_date` date NOT NULL,
	`due_date` date,
	`subtotal` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`notes` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `medical_invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) DEFAULT 'info',
	`is_read` boolean DEFAULT false,
	`action_url` varchar(500),
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_history` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_id` varchar(36) NOT NULL,
	`visit_date` date NOT NULL,
	`chief_complaint` text,
	`vital_signs` json,
	`examination` text,
	`diagnosis` text,
	`treatment` text,
	`follow_up_instructions` text,
	`doctor_id` varchar(36),
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `patient_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`patient_code` varchar(50) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`date_of_birth` date,
	`gender` varchar(10),
	`address` text,
	`emergency_contact_name` varchar(255),
	`emergency_contact_phone` varchar(20),
	`emergency_contact_relation` varchar(100),
	`insurance_provider` varchar(255),
	`insurance_number` varchar(100),
	`blood_type` varchar(5),
	`allergies` text,
	`medical_history` text,
	`current_medications` text,
	`notes` text,
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_patient_code_unique` UNIQUE(`patient_code`)
);
--> statement-breakpoint
CREATE TABLE `payroll` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`staff_id` varchar(36) NOT NULL,
	`pay_period_start` date NOT NULL,
	`pay_period_end` date NOT NULL,
	`base_salary` decimal(10,2) NOT NULL,
	`overtime` decimal(10,2) DEFAULT '0.00',
	`bonuses` decimal(10,2) DEFAULT '0.00',
	`deductions` decimal(10,2) DEFAULT '0.00',
	`gross_pay` decimal(10,2) NOT NULL,
	`net_pay` decimal(10,2) NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payroll_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescription_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`prescription_id` varchar(36) NOT NULL,
	`medication_name` varchar(255) NOT NULL,
	`dosage` varchar(100),
	`frequency` varchar(100),
	`duration` varchar(100),
	`quantity` int,
	`instructions` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `prescription_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`prescription_number` varchar(50) NOT NULL,
	`patient_id` varchar(36) NOT NULL,
	`doctor_id` varchar(36) NOT NULL,
	`appointment_id` varchar(36),
	`prescription_date` date NOT NULL,
	`valid_until` date,
	`instructions` text,
	`status` varchar(50) DEFAULT 'active',
	`notes` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `prescriptions_prescription_number_unique` UNIQUE(`prescription_number`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100),
	`category_id` varchar(36),
	`supplier_id` varchar(36),
	`cost` decimal(10,2),
	`price` decimal(10,2),
	`brand` varchar(255),
	`model` varchar(255),
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`sale_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sale_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`store_id` varchar(36) NOT NULL,
	`customer_id` varchar(36),
	`user_id` varchar(36),
	`total` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) DEFAULT '0.00',
	`discount` decimal(10,2) DEFAULT '0.00',
	`payment_method` varchar(50),
	`payment_status` varchar(50) DEFAULT 'pending',
	`notes` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` varchar(255) NOT NULL,
	`sess` json NOT NULL,
	`expire` timestamp NOT NULL,
	CONSTRAINT `sessions_sid` PRIMARY KEY(`sid`)
);
--> statement-breakpoint
CREATE TABLE `specs_orders` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_number` varchar(50) NOT NULL,
	`lens_prescription_id` varchar(36) NOT NULL,
	`patient_id` varchar(36) NOT NULL,
	`store_id` varchar(36) NOT NULL,
	`frame_id` varchar(36),
	`frame_name` varchar(255),
	`frame_price` decimal(10,2),
	`lens_price` decimal(10,2),
	`coating_price` decimal(10,2) DEFAULT '0.00',
	`additional_charges` decimal(10,2) DEFAULT '0.00',
	`subtotal` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) DEFAULT '0.00',
	`discount` decimal(10,2) DEFAULT '0.00',
	`total_amount` decimal(10,2) NOT NULL,
	`status` varchar(30) DEFAULT 'draft',
	`priority` varchar(20) DEFAULT 'normal',
	`order_date` timestamp DEFAULT (now()),
	`expected_delivery` date,
	`actual_delivery` date,
	`order_notes` text,
	`internal_notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specs_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `specs_orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`employee_id` varchar(50) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`position` varchar(100),
	`department` varchar(100),
	`store_id` varchar(36),
	`hire_date` date,
	`is_active` boolean DEFAULT true,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_employee_id_unique` UNIQUE(`employee_id`),
	CONSTRAINT `staff_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `store_inventory` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`store_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int DEFAULT 0,
	`min_stock` int DEFAULT 0,
	`max_stock` int DEFAULT 100,
	`location` varchar(255),
	`last_restocked` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`zip_code` varchar(20) NOT NULL,
	`phone` varchar(20),
	`email` varchar(255),
	`manager_id` varchar(36),
	`is_active` boolean DEFAULT true,
	`timezone` varchar(50) DEFAULT 'America/New_York',
	`opening_hours` text,
	`custom_fields` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`address` text,
	`contact_person` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`key` varchar(255) NOT NULL,
	`value` text,
	`description` text,
	`category` varchar(100),
	`is_public` boolean DEFAULT false,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`email` varchar(255),
	`first_name` varchar(100),
	`last_name` varchar(100),
	`profile_image_url` varchar(500),
	`role` varchar(50) DEFAULT 'staff',
	`is_active` boolean DEFAULT true,
	`last_login` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `workflow_notifications` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`type` varchar(50) NOT NULL,
	`recipient_type` varchar(30) NOT NULL,
	`recipient_id` varchar(36),
	`recipient_email` varchar(255),
	`recipient_phone` varchar(20),
	`specs_order_id` varchar(36),
	`lens_cutting_task_id` varchar(36),
	`delivery_id` varchar(36),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`sent_at` timestamp,
	`read_at` timestamp,
	`email_sent` boolean DEFAULT false,
	`sms_sent` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `workflow_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);