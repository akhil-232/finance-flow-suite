from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import os
from datetime import datetime, timedelta
import csv
import io
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# Configure CORS
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'spend_tracker'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'use_unicode': True,
    'autocommit': True
}

# Create connection pool
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="spend_tracker_pool",
        pool_size=5,
        pool_reset_session=True,
        **DB_CONFIG
    )
    logger.info("Database connection pool created successfully")
except Exception as e:
    logger.error(f"Failed to create database connection pool: {e}")
    connection_pool = None

def get_db_connection():
    """Get database connection from pool"""
    try:
        if connection_pool:
            return connection_pool.get_connection()
        else:
            return mysql.connector.connect(**DB_CONFIG)
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

def token_required(f):
    """Decorator for JWT token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'User already exists'}), 409
        
        # Create new user
        hashed_password = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, created_at)
            VALUES (%s, %s, %s, %s)
        """, (email, hashed_password, name, datetime.utcnow()))
        
        user_id = cursor.lastrowid
        
        # Create JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {'id': user_id, 'email': email, 'name': name}
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Create JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'message': 'Login failed'}), 500

# Categories Routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, name, color, icon, is_income, created_at
            FROM categories 
            WHERE status = 'active'
            ORDER BY name
        """)
        
        categories = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return jsonify(categories), 200
        
    except Exception as e:
        logger.error(f"Get categories error: {e}")
        return jsonify({'message': 'Failed to fetch categories'}), 500

@app.route('/api/categories', methods=['POST'])
def add_category():
    """Add a new category"""
    try:
        data = request.get_json()
        name = data.get('name')
        color = data.get('color', '#3b82f6')
        icon = data.get('icon', '📝')
        is_income = data.get('is_income', False)
        
        if not name:
            return jsonify({'message': 'Category name is required'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO categories (name, color, icon, is_income, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, color, icon, is_income, datetime.utcnow()))
        
        category_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Category added successfully',
            'id': category_id
        }), 201
        
    except Exception as e:
        logger.error(f"Add category error: {e}")
        return jsonify({'message': 'Failed to add category'}), 500

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category (soft delete)"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if category is used in transactions
        cursor.execute("SELECT COUNT(*) as count FROM transactions WHERE category_id = %s AND status = 'active'", (category_id,))
        result = cursor.fetchone()
        
        if result[0] > 0:
            return jsonify({'message': 'Cannot delete category that is being used in transactions'}), 400
        
        # Soft delete the category
        cursor.execute("""
            UPDATE categories 
            SET status = 'inactive', updated_at = %s
            WHERE id = %s
        """, (datetime.utcnow(), category_id))
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Category deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete category error: {e}")
        return jsonify({'message': 'Failed to delete category'}), 500

# Transactions Routes
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get transactions with optional filtering"""
    try:
        # Get query parameters
        category_id = request.args.get('category_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Build query
        query = """
            SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.status = 'active'
        """
        params = []
        
        if category_id:
            query += " AND t.category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        # Convert decimal to float for JSON serialization
        for transaction in transactions:
            transaction['credited'] = float(transaction['credited'])
            transaction['debited'] = float(transaction['debited'])
            transaction['running_balance'] = float(transaction['running_balance'])
        
        cursor.close()
        connection.close()
        
        return jsonify(transactions), 200
        
    except Exception as e:
        logger.error(f"Get transactions error: {e}")
        return jsonify({'message': 'Failed to fetch transactions'}), 500

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Add a new transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['transaction_date', 'category_id', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Validate that at least one amount is provided
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        
        if credited <= 0 and debited <= 0:
            return jsonify({'message': 'Either credited or debited amount must be greater than 0'}), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Calculate running balance
        cursor.execute("SELECT COALESCE(SUM(credited - debited), 0) as balance FROM transactions WHERE status = 'active'")
        current_balance = float(cursor.fetchone()[0])
        new_balance = current_balance + credited - debited
        
        # Insert transaction
        cursor.execute("""
            INSERT INTO transactions 
            (transaction_date, category_id, description, credited, debited, running_balance, tags, notes, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['transaction_date'],
            data['category_id'],
            data['description'],
            credited,
            debited,
            new_balance,
            data.get('tags', ''),
            data.get('notes', ''),
            datetime.utcnow()
        ))
        
        transaction_id = cursor.lastrowid
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_at)
            VALUES ('transactions', %s, 'INSERT', '{}', %s, %s)
        """, (transaction_id, str(data), datetime.utcnow()))
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Transaction added successfully',
            'id': transaction_id,
            'running_balance': new_balance
        }), 201
        
    except Exception as e:
        logger.error(f"Add transaction error: {e}")
        return jsonify({'message': 'Failed to add transaction'}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update a transaction"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get existing transaction
        cursor.execute("SELECT * FROM transactions WHERE id = %s AND status = 'active'", (transaction_id,))
        existing = cursor.fetchone()
        
        if not existing:
            return jsonify({'message': 'Transaction not found'}), 404
        
        # Update transaction
        cursor.execute("""
            UPDATE transactions SET
                transaction_date = %s,
                category_id = %s,
                description = %s,
                credited = %s,
                debited = %s,
                tags = %s,
                notes = %s,
                updated_at = %s
            WHERE id = %s
        """, (
            data.get('transaction_date', existing['transaction_date']),
            data.get('category_id', existing['category_id']),
            data.get('description', existing['description']),
            float(data.get('credited', existing['credited'])),
            float(data.get('debited', existing['debited'])),
            data.get('tags', existing['tags']),
            data.get('notes', existing['notes']),
            datetime.utcnow(),
            transaction_id
        ))
        
        # Recalculate running balances for all transactions
        recalculate_running_balances(cursor)
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_at)
            VALUES ('transactions', %s, 'UPDATE', %s, %s, %s)
        """, (transaction_id, str(dict(existing)), str(data), datetime.utcnow()))
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Transaction updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Update transaction error: {e}")
        return jsonify({'message': 'Failed to update transaction'}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction (soft delete)"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get existing transaction
        cursor.execute("SELECT * FROM transactions WHERE id = %s AND status = 'active'", (transaction_id,))
        existing = cursor.fetchone()
        
        if not existing:
            return jsonify({'message': 'Transaction not found'}), 404
        
        # Soft delete
        cursor.execute("""
            UPDATE transactions 
            SET status = 'inactive', updated_at = %s
            WHERE id = %s
        """, (datetime.utcnow(), transaction_id))
        
        # Recalculate running balances
        recalculate_running_balances(cursor)
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, created_at)
            VALUES ('transactions', %s, 'DELETE', %s, '{}', %s)
        """, (transaction_id, str(dict(existing)), datetime.utcnow()))
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete transaction error: {e}")
        return jsonify({'message': 'Failed to delete transaction'}), 500

def recalculate_running_balances(cursor):
    """Recalculate running balances for all active transactions"""
    cursor.execute("""
        SELECT id, credited, debited FROM transactions 
        WHERE status = 'active'
        ORDER BY transaction_date, created_at
    """)
    
    transactions = cursor.fetchall()
    running_balance = 0
    
    for transaction in transactions:
        running_balance += float(transaction['credited']) - float(transaction['debited'])
        cursor.execute("""
            UPDATE transactions 
            SET running_balance = %s 
            WHERE id = %s
        """, (running_balance, transaction['id']))

# Summary and Analytics Routes
@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get transaction summary"""
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id')
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Build query
        query = """
            SELECT 
                COALESCE(SUM(credited), 0) as total_credited,
                COALESCE(SUM(debited), 0) as total_debited,
                COALESCE(SUM(credited - debited), 0) as net_balance,
                COUNT(*) as transaction_count
            FROM transactions 
            WHERE status = 'active'
        """
        params = []
        
        if category_id:
            query += " AND category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND transaction_date <= %s"
            params.append(to_date)
        
        cursor.execute(query, params)
        summary = cursor.fetchone()
        
        # Convert to float
        summary['total_credited'] = float(summary['total_credited'])
        summary['total_debited'] = float(summary['total_debited'])
        summary['net_balance'] = float(summary['net_balance'])
        
        cursor.close()
        connection.close()
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"Get summary error: {e}")
        return jsonify({'message': 'Failed to fetch summary'}), 500

@app.route('/api/charts/category-spending', methods=['GET'])
def get_category_spending():
    """Get spending breakdown by category"""
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.name,
                c.color,
                c.icon,
                COALESCE(SUM(t.debited), 0) as total_spent
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id AND t.status = 'active'
            WHERE c.status = 'active'
        """
        params = []
        
        if from_date:
            query += " AND (t.transaction_date IS NULL OR t.transaction_date >= %s)"
            params.append(from_date)
        
        if to_date:
            query += " AND (t.transaction_date IS NULL OR t.transaction_date <= %s)"
            params.append(to_date)
        
        query += " GROUP BY c.id, c.name, c.color, c.icon HAVING total_spent > 0 ORDER BY total_spent DESC"
        
        cursor.execute(query, params)
        data = cursor.fetchall()
        
        # Convert to float
        for item in data:
            item['total_spent'] = float(item['total_spent'])
        
        cursor.close()
        connection.close()
        
        return jsonify(data), 200
        
    except Exception as e:
        logger.error(f"Get category spending error: {e}")
        return jsonify({'message': 'Failed to fetch category spending'}), 500

@app.route('/api/charts/monthly-trend', methods=['GET'])
def get_monthly_trend():
    """Get monthly spending trend"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                COALESCE(SUM(credited), 0) as total_income,
                COALESCE(SUM(debited), 0) as total_expense
            FROM transactions 
            WHERE status = 'active' 
                AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month
        """)
        
        data = cursor.fetchall()
        
        # Convert to float
        for item in data:
            item['total_income'] = float(item['total_income'])
            item['total_expense'] = float(item['total_expense'])
        
        cursor.close()
        connection.close()
        
        return jsonify(data), 200
        
    except Exception as e:
        logger.error(f"Get monthly trend error: {e}")
        return jsonify({'message': 'Failed to fetch monthly trend'}), 500

# Export Routes
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export transactions as CSV"""
    try:
        category_id = request.args.get('category_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Build query
        query = """
            SELECT 
                t.transaction_date,
                c.name as category,
                t.description,
                t.credited,
                t.debited,
                t.running_balance,
                t.tags,
                t.notes
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.status = 'active'
        """
        params = []
        
        if category_id:
            query += " AND t.category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " ORDER BY t.transaction_date DESC"
        
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        # Create CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'transaction_date', 'category', 'description', 'credited', 'debited', 
            'running_balance', 'tags', 'notes'
        ])
        
        writer.writeheader()
        for transaction in transactions:
            writer.writerow(transaction)
        
        # Create response
        output.seek(0)
        response = send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'transactions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        cursor.close()
        connection.close()
        
        return response
        
    except Exception as e:
        logger.error(f"Export CSV error: {e}")
        return jsonify({'message': 'Failed to export CSV'}), 500

# Health Check
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'database': 'connected'
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)