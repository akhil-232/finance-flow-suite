-- Spend Tracker Database Schema
-- MySQL 8.0+ Compatible

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS spend_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spend_tracker;

-- Drop tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS transaction_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS trash_bin;
DROP TABLE IF EXISTS exchange_rates;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS recurring_transactions;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table for authentication and multi-user support
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT '',
    avatar_url VARCHAR(500) DEFAULT '',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) DEFAULT NULL,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires TIMESTAMP NULL DEFAULT NULL,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Categories table for transaction categorization
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, -- NULL for system categories
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color code
    icon VARCHAR(10) DEFAULT '📝', -- Emoji or icon reference
    is_income BOOLEAN DEFAULT FALSE,
    parent_id INT DEFAULT NULL, -- For subcategories
    sort_order INT DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE, -- System categories can't be deleted
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_parent (parent_id),
    INDEX idx_sort_order (sort_order)
);

-- Transactions table - main financial records
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, -- NULL for single-user mode
    transaction_date DATE NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(15, 2) DEFAULT 0.00,
    debited DECIMAL(15, 2) DEFAULT 0.00,
    running_balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
    original_amount DECIMAL(15, 2) DEFAULT NULL,
    original_currency VARCHAR(3) DEFAULT NULL,
    reference_number VARCHAR(100) DEFAULT '',
    payment_method ENUM('cash', 'card', 'bank_transfer', 'check', 'digital_wallet', 'other') DEFAULT 'cash',
    location VARCHAR(255) DEFAULT '',
    tags VARCHAR(500) DEFAULT '',
    notes TEXT,
    receipt_url VARCHAR(500) DEFAULT '',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_id INT DEFAULT NULL,
    status ENUM('active', 'inactive', 'pending', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recurring_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    INDEX idx_date (transaction_date),
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_amount (credited, debited),
    INDEX idx_date_user (transaction_date, user_id),
    INDEX idx_recurring (recurring_id)
);

-- Recurring transactions for automated entries
CREATE TABLE recurring_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    frequency_interval INT DEFAULT 1, -- Every X days/weeks/months
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    next_execution DATE NOT NULL,
    last_execution DATE DEFAULT NULL,
    execution_count INT DEFAULT 0,
    max_executions INT DEFAULT NULL,
    auto_execute BOOLEAN DEFAULT TRUE,
    tags VARCHAR(500) DEFAULT '',
    notes TEXT,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_next_execution (next_execution),
    INDEX idx_status (status),
    INDEX idx_auto_execute (auto_execute)
);

-- Budget goals and tracking
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    category_id INT DEFAULT NULL, -- NULL for overall budget
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('spending_limit', 'savings_target', 'income_target') NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    period_type ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one_time') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00, -- Alert at 80% of target
    alert_enabled BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'completed', 'exceeded') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_period (start_date, end_date)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Tags for flexible categorization
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6b7280',
    usage_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_name (name),
    INDEX idx_usage_count (usage_count),
    UNIQUE KEY unique_user_tag (user_id, name)
);

-- Junction table for transaction-tag relationships
CREATE TABLE transaction_tags (
    transaction_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (transaction_id, tag_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Exchange rates for multi-currency support
CREATE TABLE exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_currencies (base_currency, target_currency),
    INDEX idx_date (date),
    UNIQUE KEY unique_rate (base_currency, target_currency, date)
);

-- Soft delete storage (trash bin)
CREATE TABLE trash_bin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    original_data JSON NOT NULL,
    deleted_by INT DEFAULT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restore_before TIMESTAMP DEFAULT NULL, -- Auto-delete after this date
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_restore_before (restore_before)
);

-- User sessions for JWT token management
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) DEFAULT NULL,
    device_info TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
);

-- Insert default categories
INSERT INTO categories (name, description, color, icon, is_income, is_system, status) VALUES
-- Income categories
('Salary', 'Regular employment income', '#10b981', '💼', TRUE, TRUE, 'active'),
('Freelance', 'Freelance and contract work', '#3b82f6', '💻', TRUE, TRUE, 'active'),
('Business', 'Business income and profits', '#8b5cf6', '🏢', TRUE, TRUE, 'active'),
('Investments', 'Dividends, interest, capital gains', '#f59e0b', '📈', TRUE, TRUE, 'active'),
('Gifts', 'Money received as gifts', '#ec4899', '🎁', TRUE, TRUE, 'active'),
('Other Income', 'Miscellaneous income', '#6b7280', '💰', TRUE, TRUE, 'active'),

-- Expense categories
('Food & Dining', 'Restaurants, groceries, food delivery', '#ef4444', '🍽️', FALSE, TRUE, 'active'),
('Transportation', 'Gas, public transport, rideshare', '#3b82f6', '🚗', FALSE, TRUE, 'active'),
('Shopping', 'Clothing, electronics, general shopping', '#f59e0b', '🛒', FALSE, TRUE, 'active'),
('Entertainment', 'Movies, games, hobbies, subscriptions', '#8b5cf6', '🎮', FALSE, TRUE, 'active'),
('Bills & Utilities', 'Electricity, water, internet, phone', '#ef4444', '📋', FALSE, TRUE, 'active'),
('Healthcare', 'Medical, dental, pharmacy, insurance', '#10b981', '🏥', FALSE, TRUE, 'active'),
('Education', 'Tuition, books, courses, training', '#3b82f6', '📚', FALSE, TRUE, 'active'),
('Travel', 'Flights, hotels, vacation expenses', '#f59e0b', '✈️', FALSE, TRUE, 'active'),
('Home & Garden', 'Rent, mortgage, home improvement', '#10b981', '🏠', FALSE, TRUE, 'active'),
('Personal Care', 'Haircuts, cosmetics, gym, wellness', '#ec4899', '💅', FALSE, TRUE, 'active'),
('Gifts & Donations', 'Gifts given, charitable donations', '#8b5cf6', '🎁', FALSE, TRUE, 'active'),
('Taxes', 'Income tax, property tax, other taxes', '#6b7280', '📄', FALSE, TRUE, 'active'),
('Insurance', 'Life, auto, home insurance premiums', '#ef4444', '🛡️', FALSE, TRUE, 'active'),
('Bank Fees', 'ATM fees, account fees, interest paid', '#f59e0b', '🏦', FALSE, TRUE, 'active'),
('Other Expenses', 'Miscellaneous expenses', '#6b7280', '📝', FALSE, TRUE, 'active');

-- Insert demo user (password: "demo123")
INSERT INTO users (email, password_hash, name, status, email_verified) VALUES
('demo@spendtracker.app', 'pbkdf2:sha256:260000$YourHashedPassword', 'Demo User', 'active', TRUE);

-- Insert some default tags
INSERT INTO tags (name, color, usage_count) VALUES
('work', '#3b82f6', 0),
('personal', '#10b981', 0),
('urgent', '#ef4444', 0),
('recurring', '#f59e0b', 0),
('cash', '#6b7280', 0),
('online', '#8b5cf6', 0),
('subscription', '#ec4899', 0);

-- Insert sample exchange rates (USD base)
INSERT INTO exchange_rates (base_currency, target_currency, rate, date, source) VALUES
('USD', 'EUR', 0.85, CURDATE(), 'manual'),
('USD', 'GBP', 0.75, CURDATE(), 'manual'),
('USD', 'JPY', 110.00, CURDATE(), 'manual'),
('USD', 'CAD', 1.25, CURDATE(), 'manual'),
('USD', 'AUD', 1.35, CURDATE(), 'manual'),
('USD', 'CHF', 0.92, CURDATE(), 'manual'),
('USD', 'CNY', 6.45, CURDATE(), 'manual'),
('USD', 'INR', 75.00, CURDATE(), 'manual');

-- Create views for common queries
CREATE VIEW transaction_summary AS
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') AS month,
    SUM(credited) AS total_income,
    SUM(debited) AS total_expenses,
    SUM(credited - debited) AS net_amount,
    COUNT(*) AS transaction_count
FROM transactions 
WHERE status = 'active'
GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
ORDER BY month DESC;

CREATE VIEW category_summary AS
SELECT 
    c.id,
    c.name,
    c.color,
    c.icon,
    c.is_income,
    COUNT(t.id) AS transaction_count,
    COALESCE(SUM(t.credited), 0) AS total_income,
    COALESCE(SUM(t.debited), 0) AS total_expenses,
    COALESCE(SUM(t.credited - t.debited), 0) AS net_amount
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id AND t.status = 'active'
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.color, c.icon, c.is_income
ORDER BY c.name;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE UpdateRunningBalances()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE trans_id INT;
    DECLARE trans_credited DECIMAL(15,2);
    DECLARE trans_debited DECIMAL(15,2);
    DECLARE running_total DECIMAL(15,2) DEFAULT 0;
    
    DECLARE trans_cursor CURSOR FOR 
        SELECT id, credited, debited 
        FROM transactions 
        WHERE status = 'active' 
        ORDER BY transaction_date, created_at;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN trans_cursor;
    
    read_loop: LOOP
        FETCH trans_cursor INTO trans_id, trans_credited, trans_debited;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET running_total = running_total + trans_credited - trans_debited;
        
        UPDATE transactions 
        SET running_balance = running_total 
        WHERE id = trans_id;
    END LOOP;
    
    CLOSE trans_cursor;
END //

CREATE PROCEDURE CleanupOldAuditLogs(IN days_to_keep INT)
BEGIN
    DELETE FROM audit_log 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END //

CREATE PROCEDURE ProcessRecurringTransactions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE recur_id INT;
    DECLARE recur_user_id INT;
    DECLARE recur_category_id INT;
    DECLARE recur_description VARCHAR(255);
    DECLARE recur_amount DECIMAL(15,2);
    DECLARE recur_type ENUM('income', 'expense');
    
    DECLARE recur_cursor CURSOR FOR 
        SELECT id, user_id, category_id, description, amount, type
        FROM recurring_transactions 
        WHERE status = 'active' 
          AND auto_execute = TRUE 
          AND next_execution <= CURDATE();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN recur_cursor;
    
    read_loop: LOOP
        FETCH recur_cursor INTO recur_id, recur_user_id, recur_category_id, 
                                recur_description, recur_amount, recur_type;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert transaction
        IF recur_type = 'income' THEN
            INSERT INTO transactions (user_id, transaction_date, category_id, description, credited, debited, is_recurring, recurring_id)
            VALUES (recur_user_id, CURDATE(), recur_category_id, recur_description, recur_amount, 0, TRUE, recur_id);
        ELSE
            INSERT INTO transactions (user_id, transaction_date, category_id, description, credited, debited, is_recurring, recurring_id)
            VALUES (recur_user_id, CURDATE(), recur_category_id, recur_description, 0, recur_amount, TRUE, recur_id);
        END IF;
        
        -- Update recurring transaction
        UPDATE recurring_transactions 
        SET last_execution = CURDATE(),
            execution_count = execution_count + 1,
            next_execution = CASE frequency
                WHEN 'daily' THEN DATE_ADD(next_execution, INTERVAL frequency_interval DAY)
                WHEN 'weekly' THEN DATE_ADD(next_execution, INTERVAL frequency_interval WEEK)
                WHEN 'monthly' THEN DATE_ADD(next_execution, INTERVAL frequency_interval MONTH)
                WHEN 'quarterly' THEN DATE_ADD(next_execution, INTERVAL (frequency_interval * 3) MONTH)
                WHEN 'yearly' THEN DATE_ADD(next_execution, INTERVAL frequency_interval YEAR)
            END
        WHERE id = recur_id;
        
    END LOOP;
    
    CLOSE recur_cursor;
    
    -- Update running balances
    CALL UpdateRunningBalances();
END //

DELIMITER ;

-- Create triggers for automatic audit logging
DELIMITER //

CREATE TRIGGER transactions_audit_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, table_name, record_id, action, new_values)
    VALUES (NEW.user_id, 'transactions', NEW.id, 'INSERT', 
            JSON_OBJECT('id', NEW.id, 'description', NEW.description, 'amount', NEW.credited - NEW.debited));
END //

CREATE TRIGGER transactions_audit_update
    AFTER UPDATE ON transactions
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, table_name, record_id, action, old_values, new_values)
    VALUES (NEW.user_id, 'transactions', NEW.id, 'UPDATE',
            JSON_OBJECT('description', OLD.description, 'amount', OLD.credited - OLD.debited),
            JSON_OBJECT('description', NEW.description, 'amount', NEW.credited - NEW.debited));
END //

CREATE TRIGGER transactions_audit_delete
    AFTER UPDATE ON transactions
    FOR EACH ROW
BEGIN
    IF OLD.status = 'active' AND NEW.status = 'inactive' THEN
        INSERT INTO audit_log (user_id, table_name, record_id, action, old_values)
        VALUES (NEW.user_id, 'transactions', NEW.id, 'DELETE',
                JSON_OBJECT('description', OLD.description, 'amount', OLD.credited - OLD.debited));
    END IF;
END //

DELIMITER ;

-- Create indexes for performance optimization
CREATE INDEX idx_transactions_date_amount ON transactions(transaction_date, credited, debited);
CREATE INDEX idx_transactions_category_date ON transactions(category_id, transaction_date);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_user_sessions_activity ON user_sessions(last_activity);

-- Insert performance monitoring table
CREATE TABLE performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    unit VARCHAR(20) DEFAULT 'ms',
    endpoint VARCHAR(255) DEFAULT NULL,
    user_id INT DEFAULT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_endpoint (endpoint)
);

-- Create backup tables structure (for automatic backups)
CREATE TABLE backup_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_type ENUM('full', 'incremental', 'transaction_only') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP DEFAULT NULL,
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    error_message TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_backup_type (backup_type),
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
);

-- Final setup: Set character set and collation for all tables
ALTER DATABASE spend_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optimize all tables
OPTIMIZE TABLE users, categories, transactions, recurring_transactions, goals, audit_log, tags, transaction_tags, exchange_rates, trash_bin, user_sessions;

-- Show final status
SELECT 'Database schema created successfully!' AS status;
SELECT COUNT(*) AS category_count FROM categories WHERE status = 'active';
SELECT COUNT(*) AS user_count FROM users WHERE status = 'active';