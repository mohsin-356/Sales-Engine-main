USE `sales_engine`;

-- Seed admin user (as requested)
INSERT INTO users (name, email, role, status, join_date, password)
VALUES ('Admin Mohsin', 'mohsin', 'admin', 'active', '2024-01-01', '123')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed two demo users
INSERT INTO users (name, email, role, status, join_date, password)
VALUES 
('Sarah Executive', 'sarah@mindspire.com', 'sales_executive', 'active', '2024-02-01', 'exec123'),
('Mike Rep', 'mike@mindspire.com', 'sales_representative', 'active', '2024-03-01', 'rep123')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Leads
INSERT INTO leads (client_name, project_name, estimated_value, status, follow_up_date, employee_id, phone, address, latest_info, created_date)
VALUES
('Acme Corp','Website Revamp', 500000, 'new', CURDATE(), 2, '0300-0000000', 'Karachi', 'Homepage redesign', NOW()),
('Globex','CRM Migration', 800000, 'contacted', CURDATE(), 3, '0301-1111111', 'Lahore', 'Migrating from legacy CRM', NOW());

-- Sales
INSERT INTO sales (lead_id, amount, advance_amount, status, sales_rep_id, created_at, delivery_date, project_scope)
VALUES
(1, 500000, 100000, 'pending_review', 2, NOW(), NOW(), 'Frontend + Backend'),
(2, 800000, 200000, 'verified', 3, NOW(), NOW(), 'Data migration + Integrations');

-- Attendance
INSERT INTO attendance (employee_id, date, status)
VALUES
(2, CURDATE(), 'present'),
(3, CURDATE(), 'late')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Commissions (optional seed)
INSERT INTO commissions (sale_id, amount, sales_rep_id, calculated_at)
SELECT s.id, s.amount * 0.10, s.sales_rep_id, NOW()
FROM sales s
WHERE s.status IN ('verified','delivered')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);
