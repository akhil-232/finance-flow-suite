#!/usr/bin/env python3
"""
Spend Tracker Demo Data Population Script

This script populates the database with sample transaction data
for demonstration and testing purposes.
"""

import mysql.connector
from mysql.connector import Error
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Get database connection"""
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', 3306)),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'spend_tracker'),
        charset='utf8mb4',
        use_unicode=True,
        autocommit=False
    )

def clear_existing_transactions():
    """Clear existing transaction data"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        logger.info("Clearing existing transaction data...")
        cursor.execute("DELETE FROM transaction_tags")
        cursor.execute("DELETE FROM transactions")
        cursor.execute("DELETE FROM audit_log WHERE table_name = 'transactions'")
        
        connection.commit()
        cursor.close()
        connection.close()
        logger.info("Existing transaction data cleared")
        return True
        
    except Error as e:
        logger.error(f"Error clearing data: {e}")
        return False

def get_categories():
    """Get all available categories"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT id, name, is_income FROM categories WHERE status = 'active'")
        categories = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        income_categories = [cat for cat in categories if cat['is_income']]
        expense_categories = [cat for cat in categories if not cat['is_income']]
        
        return income_categories, expense_categories
        
    except Error as e:
        logger.error(f"Error fetching categories: {e}")
        return [], []

def generate_demo_transactions():
    """Generate demo transaction data"""
    
    # Sample transaction data
    income_transactions = [
        {"description": "Salary January 2024", "amount_range": (4500, 5500), "tags": "work, monthly", "notes": "Monthly salary payment"},
        {"description": "Salary February 2024", "amount_range": (4500, 5500), "tags": "work, monthly", "notes": "Monthly salary payment"},
        {"description": "Salary March 2024", "amount_range": (4500, 5500), "tags": "work, monthly", "notes": "Monthly salary payment"},
        {"description": "Freelance Project", "amount_range": (800, 1500), "tags": "freelance, project", "notes": "Web development project"},
        {"description": "Stock Dividend", "amount_range": (50, 200), "tags": "investment, dividend", "notes": "Quarterly dividend payment"},
        {"description": "Side Hustle Income", "amount_range": (200, 600), "tags": "side-hustle, extra", "notes": "Additional income"},
        {"description": "Tax Refund", "amount_range": (300, 800), "tags": "refund, government", "notes": "Annual tax refund"},
        {"description": "Gift Money", "amount_range": (100, 500), "tags": "gift, family", "notes": "Birthday/holiday gift"},
    ]
    
    expense_transactions = [
        # Food & Dining
        {"category": "Food & Dining", "description": "Grocery Shopping", "amount_range": (80, 150), "tags": "groceries, weekly", "frequency": 7},
        {"category": "Food & Dining", "description": "Restaurant Dinner", "amount_range": (25, 75), "tags": "dining, restaurant", "frequency": 3},
        {"category": "Food & Dining", "description": "Coffee Shop", "amount_range": (5, 15), "tags": "coffee, morning", "frequency": 2},
        {"category": "Food & Dining", "description": "Food Delivery", "amount_range": (15, 35), "tags": "delivery, convenience", "frequency": 4},
        {"category": "Food & Dining", "description": "Lunch at Work", "amount_range": (8, 18), "tags": "lunch, work", "frequency": 5},
        
        # Transportation
        {"category": "Transportation", "description": "Gas Station", "amount_range": (40, 70), "tags": "gas, fuel", "frequency": 7},
        {"category": "Transportation", "description": "Uber Ride", "amount_range": (12, 35), "tags": "rideshare, transportation", "frequency": 10},
        {"category": "Transportation", "description": "Public Transit", "amount_range": (2, 8), "tags": "transit, commute", "frequency": 3},
        {"category": "Transportation", "description": "Car Maintenance", "amount_range": (100, 300), "tags": "maintenance, car", "frequency": 30},
        {"category": "Transportation", "description": "Parking Fee", "amount_range": (5, 25), "tags": "parking, city", "frequency": 7},
        
        # Shopping
        {"category": "Shopping", "description": "Amazon Purchase", "amount_range": (25, 150), "tags": "online, amazon", "frequency": 5},
        {"category": "Shopping", "description": "Clothing Store", "amount_range": (50, 200), "tags": "clothing, fashion", "frequency": 14},
        {"category": "Shopping", "description": "Electronics Store", "amount_range": (100, 500), "tags": "electronics, tech", "frequency": 30},
        {"category": "Shopping", "description": "Home Goods", "amount_range": (30, 120), "tags": "home, household", "frequency": 10},
        {"category": "Shopping", "description": "Books & Magazines", "amount_range": (15, 45), "tags": "books, education", "frequency": 14},
        
        # Entertainment
        {"category": "Entertainment", "description": "Movie Theater", "amount_range": (12, 25), "tags": "movies, entertainment", "frequency": 14},
        {"category": "Entertainment", "description": "Streaming Services", "amount_range": (10, 20), "tags": "streaming, monthly", "frequency": 30},
        {"category": "Entertainment", "description": "Concert Ticket", "amount_range": (50, 150), "tags": "concert, music", "frequency": 60},
        {"category": "Entertainment", "description": "Video Games", "amount_range": (20, 80), "tags": "gaming, entertainment", "frequency": 21},
        {"category": "Entertainment", "description": "Sports Event", "amount_range": (40, 120), "tags": "sports, tickets", "frequency": 45},
        
        # Bills & Utilities
        {"category": "Bills & Utilities", "description": "Electricity Bill", "amount_range": (80, 150), "tags": "utilities, monthly", "frequency": 30},
        {"category": "Bills & Utilities", "description": "Internet Bill", "amount_range": (50, 90), "tags": "internet, monthly", "frequency": 30},
        {"category": "Bills & Utilities", "description": "Phone Bill", "amount_range": (40, 80), "tags": "phone, monthly", "frequency": 30},
        {"category": "Bills & Utilities", "description": "Water Bill", "amount_range": (30, 60), "tags": "water, monthly", "frequency": 30},
        {"category": "Bills & Utilities", "description": "Gas Bill", "amount_range": (40, 100), "tags": "gas, heating", "frequency": 30},
        
        # Healthcare
        {"category": "Healthcare", "description": "Doctor Visit", "amount_range": (100, 250), "tags": "medical, health", "frequency": 90},
        {"category": "Healthcare", "description": "Pharmacy", "amount_range": (15, 60), "tags": "pharmacy, medication", "frequency": 14},
        {"category": "Healthcare", "description": "Dental Checkup", "amount_range": (150, 300), "tags": "dental, health", "frequency": 180},
        {"category": "Healthcare", "description": "Health Insurance", "amount_range": (200, 400), "tags": "insurance, monthly", "frequency": 30},
        {"category": "Healthcare", "description": "Gym Membership", "amount_range": (30, 80), "tags": "fitness, monthly", "frequency": 30},
        
        # Personal Care
        {"category": "Personal Care", "description": "Haircut", "amount_range": (25, 60), "tags": "haircut, grooming", "frequency": 30},
        {"category": "Personal Care", "description": "Skincare Products", "amount_range": (20, 80), "tags": "skincare, beauty", "frequency": 21},
        {"category": "Personal Care", "description": "Spa Treatment", "amount_range": (80, 200), "tags": "spa, relaxation", "frequency": 60},
        {"category": "Personal Care", "description": "Cosmetics", "amount_range": (15, 50), "tags": "makeup, beauty", "frequency": 14},
        
        # Home & Garden
        {"category": "Home & Garden", "description": "Rent Payment", "amount_range": (1200, 2000), "tags": "rent, monthly", "frequency": 30},
        {"category": "Home & Garden", "description": "Home Improvement", "amount_range": (100, 500), "tags": "home, improvement", "frequency": 45},
        {"category": "Home & Garden", "description": "Garden Supplies", "amount_range": (25, 80), "tags": "garden, plants", "frequency": 21},
        {"category": "Home & Garden", "description": "Cleaning Supplies", "amount_range": (20, 50), "tags": "cleaning, household", "frequency": 14},
        
        # Education
        {"category": "Education", "description": "Online Course", "amount_range": (50, 200), "tags": "education, learning", "frequency": 60},
        {"category": "Education", "description": "Textbooks", "amount_range": (80, 300), "tags": "books, education", "frequency": 90},
        {"category": "Education", "description": "Professional Training", "amount_range": (200, 800), "tags": "training, professional", "frequency": 120},
        
        # Travel
        {"category": "Travel", "description": "Flight Ticket", "amount_range": (200, 800), "tags": "flight, travel", "frequency": 120},
        {"category": "Travel", "description": "Hotel Booking", "amount_range": (100, 300), "tags": "hotel, accommodation", "frequency": 90},
        {"category": "Travel", "description": "Travel Insurance", "amount_range": (30, 100), "tags": "insurance, travel", "frequency": 180},
        {"category": "Travel", "description": "Tourist Activities", "amount_range": (50, 200), "tags": "activities, tourism", "frequency": 180},
        
        # Gifts & Donations
        {"category": "Gifts & Donations", "description": "Birthday Gift", "amount_range": (25, 100), "tags": "gift, birthday", "frequency": 45},
        {"category": "Gifts & Donations", "description": "Charity Donation", "amount_range": (20, 100), "tags": "charity, donation", "frequency": 60},
        {"category": "Gifts & Donations", "description": "Holiday Gifts", "amount_range": (50, 200), "tags": "holiday, gifts", "frequency": 90},
        
        # Bank Fees
        {"category": "Bank Fees", "description": "ATM Fee", "amount_range": (3, 8), "tags": "atm, fee", "frequency": 14},
        {"category": "Bank Fees", "description": "Account Maintenance", "amount_range": (10, 25), "tags": "bank, monthly", "frequency": 30},
        {"category": "Bank Fees", "description": "Overdraft Fee", "amount_range": (25, 40), "tags": "overdraft, penalty", "frequency": 120},
    ]
    
    return income_transactions, expense_transactions

def populate_transactions():
    """Populate the database with demo transactions"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Get categories
        income_categories, expense_categories = get_categories()
        if not income_categories or not expense_categories:
            logger.error("No categories found. Please run the database setup first.")
            return False
        
        # Generate demo data
        income_data, expense_data = generate_demo_transactions()
        
        # Create category lookup
        expense_category_map = {cat['name']: cat['id'] for cat in expense_categories}
        
        # Generate transactions for the last 90 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        transactions = []
        running_balance = 0
        
        # Generate income transactions
        logger.info("Generating income transactions...")
        current_date = start_date
        while current_date <= end_date:
            # Monthly salary (around the 1st of each month)
            if current_date.day == 1:
                salary_data = next((t for t in income_data if "Salary" in t["description"]), income_data[0])
                amount = random.uniform(*salary_data["amount_range"])
                running_balance += amount
                
                transactions.append({
                    'date': current_date.date(),
                    'category_id': random.choice(income_categories)['id'],
                    'description': salary_data['description'].replace("January 2024", current_date.strftime("%B %Y")),
                    'credited': amount,
                    'debited': 0,
                    'running_balance': running_balance,
                    'tags': salary_data['tags'],
                    'notes': salary_data['notes']
                })
            
            # Occasional other income
            if random.random() < 0.05:  # 5% chance per day
                income_item = random.choice(income_data[3:])  # Skip salary entries
                amount = random.uniform(*income_item["amount_range"])
                running_balance += amount
                
                transactions.append({
                    'date': current_date.date(),
                    'category_id': random.choice(income_categories)['id'],
                    'description': income_item['description'],
                    'credited': amount,
                    'debited': 0,
                    'running_balance': running_balance,
                    'tags': income_item['tags'],
                    'notes': income_item['notes']
                })
            
            current_date += timedelta(days=1)
        
        # Generate expense transactions
        logger.info("Generating expense transactions...")
        current_date = start_date
        last_occurrence = {}
        
        while current_date <= end_date:
            for expense_item in expense_data:
                category_name = expense_item.get('category', 'Other Expenses')
                category_id = expense_category_map.get(category_name)
                
                if not category_id:
                    continue
                
                frequency = expense_item.get('frequency', 30)
                key = f"{category_name}_{expense_item['description']}"
                
                # Check if it's time for this transaction
                if key not in last_occurrence:
                    should_occur = random.random() < (1.0 / frequency)
                else:
                    days_since_last = (current_date.date() - last_occurrence[key]).days
                    should_occur = days_since_last >= frequency or random.random() < (days_since_last / frequency * 0.1)
                
                if should_occur:
                    amount = random.uniform(*expense_item["amount_range"])
                    running_balance -= amount
                    last_occurrence[key] = current_date.date()
                    
                    transactions.append({
                        'date': current_date.date(),
                        'category_id': category_id,
                        'description': expense_item['description'],
                        'credited': 0,
                        'debited': amount,
                        'running_balance': running_balance,
                        'tags': expense_item.get('tags', ''),
                        'notes': expense_item.get('notes', '')
                    })
            
            current_date += timedelta(days=1)
        
        # Sort transactions by date
        transactions.sort(key=lambda x: x['date'])
        
        # Recalculate running balances
        running_balance = 0
        for transaction in transactions:
            running_balance += transaction['credited'] - transaction['debited']
            transaction['running_balance'] = running_balance
        
        # Insert transactions
        logger.info(f"Inserting {len(transactions)} transactions...")
        
        for transaction in transactions:
            cursor.execute("""
                INSERT INTO transactions 
                (transaction_date, category_id, description, credited, debited, running_balance, tags, notes, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                transaction['date'],
                transaction['category_id'],
                transaction['description'],
                transaction['credited'],
                transaction['debited'],
                transaction['running_balance'],
                transaction['tags'],
                transaction['notes'],
                datetime.utcnow()
            ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"Successfully inserted {len(transactions)} demo transactions!")
        logger.info(f"Final balance: ${running_balance:.2f}")
        
        return True
        
    except Error as e:
        logger.error(f"Error populating transactions: {e}")
        return False

def main():
    """Main function"""
    logger.info("=== Spend Tracker Demo Data Population ===")
    
    # Ask user if they want to clear existing data
    response = input("Do you want to clear existing transaction data? (y/N): ").lower()
    if response in ['y', 'yes']:
        if not clear_existing_transactions():
            logger.error("Failed to clear existing data")
            return
    
    # Populate with demo data
    if populate_transactions():
        logger.info("Demo data population completed successfully!")
        logger.info("You can now use the application with sample data.")
    else:
        logger.error("Demo data population failed!")

if __name__ == "__main__":
    main()