-- Spend Tracker Database Schema
CREATE DATABASE IF NOT EXISTS spend_tracker;
USE spend_tracker;

-- Users table for multi-user support
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50),
    description TEXT,
    parent_id INT,
    user_id INT DEFAULT NULL, -- NULL for global categories, user_id for user-specific
    sort_order INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id)
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, -- NULL for demo mode, user_id for multi-user
    transaction_date DATE NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(15, 2) DEFAULT 0.00,
    debited DECIMAL(15, 2) DEFAULT 0.00,
    running_balance DECIMAL(15, 2) DEFAULT 0.00,
    tags VARCHAR(500),
    notes TEXT,
    reference_number VARCHAR(100),
    attachment_url VARCHAR(500),
    location VARCHAR(255),
    status ENUM('active', 'inactive', 'pending', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (transaction_date),
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_amount (credited, debited),
    INDEX idx_date_user (transaction_date, user_id)
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    template_name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(15, 2) DEFAULT 0.00,
    debited DECIMAL(15, 2) DEFAULT 0.00,
    tags VARCHAR(500),
    notes TEXT,
    recurrence_type ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    recurrence_interval INT DEFAULT 1, -- every N days/weeks/months
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE NOT NULL,
    last_generated DATE,
    max_occurrences INT,
    generated_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_next_due (next_due_date),
    INDEX idx_status (status)
);

-- Budget goals table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    period_type ENUM('weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00, -- Alert when 80% of budget used
    status ENUM('active', 'inactive', 'completed', 'exceeded') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_category (category_id),
    INDEX idx_period (start_date, end_date),
    INDEX idx_status (status)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- Tags table for better tag management
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6b7280',
    user_id INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Transaction tags junction table
CREATE TABLE transaction_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_tag (transaction_id, tag_id)
);

-- Exchange rates table for multi-currency support
CREATE TABLE exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15, 8) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(100) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_date (from_currency, to_currency, date),
    INDEX idx_currencies (from_currency, to_currency),
    INDEX idx_date (date)
);

-- Trash bin for soft-deleted records
CREATE TABLE trash_bin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    record_data JSON NOT NULL,
    deleted_by INT,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restore_deadline TIMESTAMP NULL, -- Auto-delete after this date
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_deadline (restore_deadline)
);

-- Sessions table for JWT token management
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires (expires_at),
    INDEX idx_status (status)
);

-- Insert default categories
INSERT INTO categories (name, color, icon, description) VALUES
('Food & Dining', '#ef4444', '🍽️', 'Restaurants, groceries, and food delivery'),
('Transportation', '#3b82f6', '🚗', 'Gas, public transport, ride-sharing'),
('Shopping', '#8b5cf6', '🛍️', 'Clothing, electronics, and general shopping'),
('Entertainment', '#f59e0b', '🎬', 'Movies, games, streaming services'),
('Bills & Utilities', '#10b981', '⚡', 'Electricity, water, internet, phone'),
('Healthcare', '#ec4899', '🏥', 'Medical expenses, pharmacy, insurance'),
('Education', '#6366f1', '📚', 'Books, courses, tuition fees'),
('Travel', '#14b8a6', '✈️', 'Flights, hotels, vacation expenses'),
('Income', '#22c55e', '💰', 'Salary, freelance, investments'),
('Savings', '#059669', '🏦', 'Emergency fund, investments, savings'),
('Insurance', '#7c3aed', '🛡️', 'Health, auto, life insurance'),
('Gifts & Donations', '#f97316', '🎁', 'Charity, gifts, donations'),
('Personal Care', '#06b6d4', '💅', 'Haircut, cosmetics, gym membership'),
('Home & Garden', '#84cc16', '🏡', 'Rent, mortgage, home improvement'),
('Taxes', '#dc2626', '📊', 'Income tax, property tax, other taxes');

-- Insert sample data for demo
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('demo_user', 'demo@spendtracker.com', '$2b$12$example_hash', 'Demo', 'User');

SET @demo_user_id = LAST_INSERT_ID();

-- Sample transactions for demo
INSERT INTO transactions (user_id, transaction_date, category_id, description, credited, debited, running_balance) VALUES
(@demo_user_id, '2024-01-01', 9, 'Salary January 2024', 5000.00, 0.00, 5000.00),
(@demo_user_id, '2024-01-02', 1, 'Grocery Shopping', 0.00, 150.75, 4849.25),
(@demo_user_id, '2024-01-03', 2, 'Gas Station', 0.00, 45.50, 4803.75),
(@demo_user_id, '2024-01-04', 4, 'Netflix Subscription', 0.00, 15.99, 4787.76),
(@demo_user_id, '2024-01-05', 5, 'Electricity Bill', 0.00, 125.40, 4662.36),
(@demo_user_id, '2024-01-06', 1, 'Restaurant Dinner', 0.00, 67.80, 4594.56),
(@demo_user_id, '2024-01-07', 3, 'Amazon Purchase', 0.00, 89.99, 4504.57),
(@demo_user_id, '2024-01-08', 10, 'Emergency Fund', 0.00, 500.00, 4004.57),
(@demo_user_id, '2024-01-09', 13, 'Gym Membership', 0.00, 49.99, 3954.58),
(@demo_user_id, '2024-01-10', 2, 'Uber Ride', 0.00, 23.45, 3931.13);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date_category ON transactions(transaction_date, category_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_categories_user_status ON categories(user_id, status);

-- Create views for common queries
CREATE VIEW v_transaction_summary AS
SELECT 
    t.id,
    t.user_id,
    t.transaction_date,
    t.description,
    t.credited,
    t.debited,
    t.running_balance,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    t.tags,
    t.notes,
    t.status
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.status = 'active';

CREATE VIEW v_monthly_summary AS
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') as month,
    COALESCE(SUM(credited), 0) as total_credited,
    COALESCE(SUM(debited), 0) as total_debited,
    COALESCE(SUM(credited) - SUM(debited), 0) as net_amount,
    COUNT(*) as transaction_count
FROM transactions 
WHERE status = 'active'
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
ORDER BY month DESC;