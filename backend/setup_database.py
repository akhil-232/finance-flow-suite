#!/usr/bin/env python3
"""
Spend Tracker Database Setup Script

This script creates the database and executes the schema.sql file.
Run this script to set up your database for the first time.
"""

import mysql.connector
from mysql.connector import Error
import os
import sys
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_database_config():
    """Get database configuration from environment variables."""
    return {
        'host': os.getenv('MYSQL_HOST', 'localhost'),
        'port': int(os.getenv('MYSQL_PORT', 3306)),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
        'charset': 'utf8mb4',
        'use_unicode': True,
        'autocommit': False
    }

def create_database_if_not_exists(config):
    """Create the database if it doesn't exist."""
    db_name = os.getenv('MYSQL_DATABASE', 'spend_tracker')
    
    try:
        # Connect without specifying database
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            logger.info(f"Creating database: {db_name}")
            cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            logger.info(f"Database '{db_name}' created successfully")
        else:
            logger.info(f"Database '{db_name}' already exists")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        logger.error(f"Error creating database: {e}")
        return False

def test_connection():
    """Test database connection."""
    config = get_database_config()
    config['database'] = os.getenv('MYSQL_DATABASE', 'spend_tracker')
    
    try:
        logger.info("Testing database connection...")
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            logger.info(f"Successfully connected to MySQL Server version {version[0]}")
            
            cursor.execute("SELECT DATABASE()")
            database = cursor.fetchone()
            logger.info(f"Connected to database: {database[0]}")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return False

def execute_schema():
    """Execute the schema.sql file to create tables."""
    config = get_database_config()
    config['database'] = os.getenv('MYSQL_DATABASE', 'spend_tracker')
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    schema_file = os.path.join(script_dir, 'database', 'schema.sql')
    
    if not os.path.exists(schema_file):
        logger.error(f"Schema file not found: {schema_file}")
        return False
    
    try:
        logger.info("Reading schema file...")
        with open(schema_file, 'r', encoding='utf-8') as file:
            schema_content = file.read()
        
        logger.info("Executing schema...")
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Split the schema into individual statements
        statements = []
        current_statement = []
        in_delimiter = False
        delimiter = ';'
        
        for line in schema_content.split('\n'):
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('--'):
                continue
            
            # Handle DELIMITER statements
            if line.upper().startswith('DELIMITER'):
                delimiter = line.split()[-1]
                in_delimiter = delimiter != ';'
                continue
            
            current_statement.append(line)
            
            # Check if statement is complete
            if line.endswith(delimiter) and not in_delimiter:
                stmt = ' '.join(current_statement).rstrip(delimiter)
                if stmt.strip():
                    statements.append(stmt)
                current_statement = []
            elif line.endswith('//') and in_delimiter:
                stmt = ' '.join(current_statement).rstrip('//')
                if stmt.strip():
                    statements.append(stmt)
                current_statement = []
        
        # Add any remaining statement
        if current_statement:
            stmt = ' '.join(current_statement)
            if stmt.strip():
                statements.append(stmt)
        
        # Execute each statement
        for i, statement in enumerate(statements):
            try:
                logger.info(f"Executing statement {i + 1}/{len(statements)}")
                cursor.execute(statement)
                connection.commit()
            except Error as e:
                # Log the error but continue with other statements
                logger.warning(f"Error executing statement {i + 1}: {e}")
                logger.warning(f"Statement: {statement[:100]}...")
                connection.rollback()
        
        cursor.close()
        connection.close()
        logger.info("Schema executed successfully!")
        return True
        
    except Error as e:
        logger.error(f"Error executing schema: {e}")
        return False
    except FileNotFoundError:
        logger.error(f"Schema file not found: {schema_file}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return False

def verify_tables():
    """Verify that all tables were created successfully."""
    config = get_database_config()
    config['database'] = os.getenv('MYSQL_DATABASE', 'spend_tracker')
    
    expected_tables = [
        'users', 'categories', 'transactions', 'recurring_transactions',
        'goals', 'audit_log', 'tags', 'transaction_tags', 
        'exchange_rates', 'trash_bin', 'user_sessions'
    ]
    
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Get list of tables
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        logger.info(f"Found {len(tables)} tables in database")
        
        missing_tables = set(expected_tables) - set(tables)
        if missing_tables:
            logger.warning(f"Missing tables: {', '.join(missing_tables)}")
        else:
            logger.info("All expected tables found!")
        
        # Get row counts for key tables
        for table in ['categories', 'users']:
            if table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                logger.info(f"Table '{table}': {count} rows")
        
        cursor.close()
        connection.close()
        return len(missing_tables) == 0
        
    except Error as e:
        logger.error(f"Error verifying tables: {e}")
        return False

def main():
    """Main setup function."""
    logger.info("=== Spend Tracker Database Setup ===")
    logger.info("Starting database setup process...")
    
    # Check environment variables
    required_vars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please create a .env file based on .env.example")
        sys.exit(1)
    
    # Step 1: Create database if it doesn't exist
    config = get_database_config()
    if not create_database_if_not_exists(config):
        logger.error("Failed to create database")
        sys.exit(1)
    
    # Step 2: Test connection
    if not test_connection():
        logger.error("Database connection test failed")
        sys.exit(1)
    
    # Step 3: Execute schema
    if not execute_schema():
        logger.error("Failed to execute schema")
        sys.exit(1)
    
    # Step 4: Verify tables
    if not verify_tables():
        logger.warning("Some tables may be missing, but setup completed")
    
    logger.info("=== Database Setup Complete! ===")
    logger.info("Your Spend Tracker database is ready to use.")
    logger.info("You can now start the Flask application.")

if __name__ == "__main__":
    main()