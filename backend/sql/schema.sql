-- Create database
CREATE DATABASE IF NOT EXISTS `sales_engine` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sales_engine`;

-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `role` ENUM('admin','sales_executive','sales_representative') NOT NULL DEFAULT 'sales_representative',
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `join_date` DATE DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-user monthly targets
CREATE TABLE IF NOT EXISTS `user_targets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `month` TINYINT NOT NULL, -- 1-12
  `year` SMALLINT NOT NULL,
  `lead_target` INT DEFAULT 0,
  `sales_target` INT DEFAULT 0,
  `revenue_target` DECIMAL(12,2) DEFAULT 0,
  `conversion_target` DECIMAL(5,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_month_year` (`user_id`, `month`, `year`),
  CONSTRAINT `user_targets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: per-user daily targets for granular assignments
CREATE TABLE IF NOT EXISTS `user_daily_targets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `lead_target` INT DEFAULT 0,
  `sales_target` INT DEFAULT 0,
  `revenue_target` DECIMAL(12,2) DEFAULT 0,
  `conversion_goal` DECIMAL(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_date` (`user_id`, `date`),
  CONSTRAINT `user_daily_targets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leads
CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_name` VARCHAR(160) NOT NULL,
  `project_name` VARCHAR(160) NOT NULL,
  `estimated_value` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` ENUM('new','contacted','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
  `follow_up_date` DATE DEFAULT NULL,
  `employee_id` INT UNSIGNED DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `latest_info` TEXT DEFAULT NULL,
  `client_response` TEXT DEFAULT NULL,
  `expected_close_date` DATE DEFAULT NULL,
  `source` VARCHAR(80) DEFAULT NULL,
  `priority` ENUM('low','medium','high') DEFAULT 'medium',
  `score` INT DEFAULT NULL,
  `probability` TINYINT DEFAULT NULL,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_fk` (`employee_id`),
  CONSTRAINT `leads_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lead Activities
CREATE TABLE IF NOT EXISTS `lead_activities` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` INT UNSIGNED NOT NULL,
  `note` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lead_activities_lead_fk` (`lead_id`),
  CONSTRAINT `lead_activities_lead_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales
CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` INT UNSIGNED DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `advance_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` ENUM('pending_review','verified','rejected','delivered') NOT NULL DEFAULT 'pending_review',
  `sales_rep_id` INT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `delivery_date` DATETIME DEFAULT NULL,
  `project_scope` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_fk` (`lead_id`),
  KEY `sales_rep_fk` (`sales_rep_id`),
  CONSTRAINT `sales_lead_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_rep_fk` FOREIGN KEY (`sales_rep_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present','absent','late') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  CONSTRAINT `attendance_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Commissions
CREATE TABLE IF NOT EXISTS `commissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `sales_rep_id` INT UNSIGNED NOT NULL,
  `calculated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `commission_sale_fk` (`sale_id`),
  KEY `commission_rep_fk` (`sales_rep_id`),
  CONSTRAINT `commission_sale_fk` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commission_rep_fk` FOREIGN KEY (`sales_rep_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
