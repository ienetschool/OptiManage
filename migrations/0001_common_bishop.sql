ALTER TABLE `medical_appointments` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `medical_appointments` MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `medical_appointments` ADD `appointment_fee` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `medical_appointments` ADD `paid_amount` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `medical_appointments` ADD `remaining_balance` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `medical_appointments` ADD `is_paid` boolean DEFAULT false;