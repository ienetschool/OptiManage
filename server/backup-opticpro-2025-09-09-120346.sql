-- MySQL Database Backup
-- Database: opticpro
-- Generated on: 2025-09-09 12:03:46
-- Host: 5.181.218.15:3306
-- ------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `opticpro` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `opticpro`;

-- Table structure for patients
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL,
  `patient_code` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `insurance_provider` varchar(100) DEFAULT NULL,
  `insurance_number` varchar(50) DEFAULT NULL,
  `blood_type` varchar(5) DEFAULT NULL,
  `allergies` text,
  `medical_history` text,
  `current_medications` text,
  `notes` text,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_code` (`patient_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for doctors
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` varchar(36) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `qualification` text,
  `experience` int DEFAULT NULL,
  `consultation_fee` decimal(10,2) DEFAULT NULL,
  `schedule` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for appointments
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `service` varchar(100) NOT NULL,
  `status` enum('scheduled','confirmed','completed','cancelled','no-show') DEFAULT 'scheduled',
  `notes` text,
  `fee` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','paid','partially_paid','cancelled') DEFAULT 'pending',
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `appointment_date` (`appointment_date`),
  CONSTRAINT `appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `appointments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for prescriptions
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` varchar(36) NOT NULL,
  `prescription_number` varchar(50) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `doctor_id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `prescription_date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `instructions` text,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `notes` text,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescription_number` (`prescription_number`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `prescriptions_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `prescriptions_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `prescriptions_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for medical_invoices
DROP TABLE IF EXISTS `medical_invoices`;
CREATE TABLE `medical_invoices` (
  `id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `appointment_id` varchar(36) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) DEFAULT 0.00,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `patient_id` (`patient_id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `medical_invoices_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `medical_invoices_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for stores
DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `manager_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `sku` varchar(50) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for store_inventory
DROP TABLE IF EXISTS `store_inventory`;
CREATE TABLE `store_inventory` (
  `id` varchar(36) NOT NULL,
  `store_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `min_stock` int DEFAULT 0,
  `max_stock` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `last_restocked` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `store_id` (`store_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `store_inventory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `store_inventory_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `date_of_birth` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for sales
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `store_id` varchar(36) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) DEFAULT 0.00,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` enum('pending','completed','cancelled','refunded') DEFAULT 'pending',
  `notes` text,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `sales_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `sales_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for staff
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `store_id` varchar(36) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `custom_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `staff_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Backup completed successfully
-- Total tables backed up: 11
-- Backup file: backup-opticpro-2025-09-09-120346.sql