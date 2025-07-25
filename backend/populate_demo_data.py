#!/usr/bin/env python3
"""
Demo data population script for Spend Tracker
This script adds sample transactions for testing and demonstration
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'spend_tracker')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def add_demo_transactions():
    """Add sample transactions for the last 3 months"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get all categories
        cursor.execute("SELECT id, name FROM categories WHERE status = 'active'")
        categories = cursor.fetchall()
        
        if not categories:
            print("❌ No categories found. Please run the schema first.")
            return False
        
        # Sample transaction data
        sample_transactions = [
            # Income transactions
            {"desc": "Salary - January", "credited": 5000.00, "debited": 0.00, "category": "Income", "days_ago": 60},
            {"desc": "Salary - February", "credited": 5000.00, "debited": 0.00, "category": "Income", "days_ago": 30},
            {"desc": "Salary - March", "credited": 5000.00, "debited": 0.00, "category": "Income", "days_ago": 1},
            {"desc": "Freelance Project", "credited": 1200.00, "debited": 0.00, "category": "Income", "days_ago": 15},
            {"desc": "Investment Returns", "credited": 350.00, "debited": 0.00, "category": "Income", "days_ago": 10},
            
            # Expense transactions
            {"desc": "Whole Foods Grocery", "credited": 0.00, "debited": 156.78, "category": "Food & Dining", "days_ago": 2},
            {"desc": "Starbucks Coffee", "credited": 0.00, "debited": 12.45, "category": "Food & Dining", "days_ago": 3},
            {"desc": "McDonald's Lunch", "credited": 0.00, "debited": 8.99, "category": "Food & Dining", "days_ago": 5},
            {"desc": "Pizza Delivery", "credited": 0.00, "debited": 28.50, "category": "Food & Dining", "days_ago": 7},
            {"desc": "Restaurant Dinner", "credited": 0.00, "debited": 67.80, "category": "Food & Dining", "days_ago": 12},
            
            {"desc": "Gas Station Fill-up", "credited": 0.00, "debited": 45.50, "category": "Transportation", "days_ago": 4},
            {"desc": "Uber Ride Downtown", "credited": 0.00, "debited": 23.45, "category": "Transportation", "days_ago": 8},
            {"desc": "Car Insurance", "credited": 0.00, "debited": 125.00, "category": "Transportation", "days_ago": 20},
            {"desc": "Metro Card Refill", "credited": 0.00, "debited": 30.00, "category": "Transportation", "days_ago": 25},
            
            {"desc": "Amazon Prime Purchase", "credited": 0.00, "debited": 89.99, "category": "Shopping", "days_ago": 6},
            {"desc": "Target Shopping", "credited": 0.00, "debited": 156.32, "category": "Shopping", "days_ago": 14},
            {"desc": "Nike Sneakers", "credited": 0.00, "debited": 120.00, "category": "Shopping", "days_ago": 18},
            {"desc": "Best Buy Electronics", "credited": 0.00, "debited": 299.99, "category": "Shopping", "days_ago": 35},
            
            {"desc": "Netflix Subscription", "credited": 0.00, "debited": 15.99, "category": "Entertainment", "days_ago": 1},
            {"desc": "Movie Theater Tickets", "credited": 0.00, "debited": 24.00, "category": "Entertainment", "days_ago": 9},
            {"desc": "Spotify Premium", "credited": 0.00, "debited": 9.99, "category": "Entertainment", "days_ago": 15},
            {"desc": "Steam Game Purchase", "credited": 0.00, "debited": 59.99, "category": "Entertainment", "days_ago": 22},
            
            {"desc": "Electricity Bill", "credited": 0.00, "debited": 125.40, "category": "Bills & Utilities", "days_ago": 5},
            {"desc": "Internet Bill", "credited": 0.00, "debited": 79.99, "category": "Bills & Utilities", "days_ago": 10},
            {"desc": "Phone Bill", "credited": 0.00, "debited": 65.00, "category": "Bills & Utilities", "days_ago": 15},
            {"desc": "Water Bill", "credited": 0.00, "debited": 45.67, "category": "Bills & Utilities", "days_ago": 28},
            
            {"desc": "Doctor Visit Copay", "credited": 0.00, "debited": 35.00, "category": "Healthcare", "days_ago": 11},
            {"desc": "Pharmacy Prescription", "credited": 0.00, "debited": 15.99, "category": "Healthcare", "days_ago": 16},
            {"desc": "Dental Cleaning", "credited": 0.00, "debited": 150.00, "category": "Healthcare", "days_ago": 45},
            
            {"desc": "Online Course", "credited": 0.00, "debited": 49.99, "category": "Education", "days_ago": 13},
            {"desc": "Programming Books", "credited": 0.00, "debited": 85.50, "category": "Education", "days_ago": 30},
            
            {"desc": "Flight to NYC", "credited": 0.00, "debited": 320.00, "category": "Travel", "days_ago": 40},
            {"desc": "Hotel Stay", "credited": 0.00, "debited": 180.00, "category": "Travel", "days_ago": 38},
            
            {"desc": "Emergency Fund Deposit", "credited": 0.00, "debited": 500.00, "category": "Savings", "days_ago": 20},
            {"desc": "401k Contribution", "credited": 0.00, "debited": 800.00, "category": "Savings", "days_ago": 30},
            
            {"desc": "Gym Membership", "credited": 0.00, "debited": 49.99, "category": "Personal Care", "days_ago": 17},
            {"desc": "Haircut", "credited": 0.00, "debited": 35.00, "category": "Personal Care", "days_ago": 25},
            
            {"desc": "Rent Payment", "credited": 0.00, "debited": 1200.00, "category": "Home & Garden", "days_ago": 1},
            {"desc": "Home Depot Supplies", "credited": 0.00, "debited": 78.99, "category": "Home & Garden", "days_ago": 19},
        ]
        
        # Create category lookup
        category_map = {cat['name']: cat['id'] for cat in categories}
        
        added_count = 0
        running_balance = 0.00
        
        # Sort transactions by days_ago (oldest first) to maintain proper running balance
        sample_transactions.sort(key=lambda x: x['days_ago'], reverse=True)
        
        for transaction in sample_transactions:
            # Find category ID
            category_id = None
            for cat_name, cat_id in category_map.items():
                if transaction['category'] in cat_name or cat_name in transaction['category']:
                    category_id = cat_id
                    break
            
            if not category_id:
                print(f"⚠️  Category not found for: {transaction['category']}")
                continue
            
            # Calculate transaction date
            transaction_date = datetime.now() - timedelta(days=transaction['days_ago'])
            
            # Update running balance
            running_balance += transaction['credited'] - transaction['debited']
            
            # Insert transaction
            cursor.execute("""
                INSERT INTO transactions 
                (transaction_date, category_id, description, credited, debited, running_balance, tags, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                transaction_date.strftime('%Y-%m-%d'),
                category_id,
                transaction['desc'],
                transaction['credited'],
                transaction['debited'],
                running_balance,
                'demo, sample' if random.choice([True, False]) else '',
                'Sample transaction for demonstration' if random.choice([True, False, False]) else ''
            ))
            
            added_count += 1
        
        connection.commit()
        print(f"✅ Added {added_count} demo transactions!")
        print(f"💰 Final balance: ${running_balance:,.2f}")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Error adding demo data: {e}")
        return False

def clear_existing_transactions():
    """Clear existing transactions (for fresh demo)"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM transactions")
        connection.commit()
        
        count = cursor.rowcount
        print(f"🗑️  Cleared {count} existing transactions")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Error clearing transactions: {e}")
        return False

def main():
    print("🎭 Setting up demo data for Spend Tracker...")
    print("=" * 50)
    
    # Ask user if they want to clear existing data
    response = input("Do you want to clear existing transactions? (y/N): ").lower().strip()
    if response in ['y', 'yes']:
        print("🗑️  Clearing existing transactions...")
        if not clear_existing_transactions():
            return
    
    # Add demo transactions
    print("📝 Adding demo transactions...")
    if not add_demo_transactions():
        return
    
    print("=" * 50)
    print("🎉 Demo data setup completed!")
    print("🚀 You can now view the sample data in your Spend Tracker app")
    print("💡 Tip: Use the date filters to explore transactions from different periods")

if __name__ == "__main__":
    main()