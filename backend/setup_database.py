#!/usr/bin/env python3
"""
Database setup script for Spend Tracker
This script will create the database and run the schema
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', '')
        )
        
        cursor = connection.cursor()
        
        # Create database
        database_name = os.getenv('MYSQL_DATABASE', 'spend_tracker')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        print(f"✅ Database '{database_name}' created successfully!")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"❌ Error creating database: {e}")
        return False
    
    return True

def run_schema():
    """Run the schema file to create tables"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'spend_tracker')
        )
        
        cursor = connection.cursor()
        
        # Read and execute schema file
        schema_file = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
        
        if not os.path.exists(schema_file):
            print(f"❌ Schema file not found: {schema_file}")
            return False
        
        with open(schema_file, 'r', encoding='utf-8') as file:
            schema_content = file.read()
        
        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in schema_content.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement:
                try:
                    cursor.execute(statement)
                except Error as e:
                    print(f"⚠️  Warning executing statement: {e}")
                    continue
        
        connection.commit()
        print("✅ Database schema created successfully!")
        
        # Show created tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"📋 Created {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"❌ Error running schema: {e}")
        return False
    
    return True

def test_connection():
    """Test the database connection"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'spend_tracker')
        )
        
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM categories")
        count = cursor.fetchone()[0]
        print(f"✅ Database connection successful! Found {count} categories.")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    print("🚀 Setting up Spend Tracker database...")
    print("=" * 50)
    
    # Load environment variables
    if not os.path.exists('.env'):
        print("⚠️  No .env file found. Using default values.")
        print("📝 Create a .env file with your database credentials:")
        print("   MYSQL_HOST=localhost")
        print("   MYSQL_USER=root")
        print("   MYSQL_PASSWORD=your_password")
        print("   MYSQL_DATABASE=spend_tracker")
        print("   SECRET_KEY=your-secret-key")
        print()
    
    # Step 1: Create database
    print("1️⃣  Creating database...")
    if not create_database():
        return
    
    # Step 2: Run schema
    print("2️⃣  Running database schema...")
    if not run_schema():
        return
    
    # Step 3: Test connection
    print("3️⃣  Testing database connection...")
    if not test_connection():
        return
    
    print("=" * 50)
    print("🎉 Database setup completed successfully!")
    print("🚀 You can now start the Flask server with: python app.py")

if __name__ == "__main__":
    main()