from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import datetime
import csv
import io
import os
from decimal import Decimal
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', '')
app.config['MYSQL_DATABASE'] = os.environ.get('MYSQL_DATABASE', 'spend_tracker')

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DATABASE']
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Spend Tracker API is running'})

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'All fields are required'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'User already exists'}), 400
        
        # Create user
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        connection.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s AND status = 'active'", (email,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, app.config['SECRET_KEY'])
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            })
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Categories routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories WHERE status = 'active' ORDER BY name")
        categories = cursor.fetchall()
        return jsonify(categories)
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    name = data.get('name')
    color = data.get('color', '#6366f1')
    
    if not name:
        return jsonify({'message': 'Category name is required'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO categories (name, color) VALUES (%s, %s)",
            (name, color)
        )
        connection.commit()
        
        return jsonify({'message': 'Category added successfully', 'id': cursor.lastrowid}), 201
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE categories SET status = 'inactive' WHERE id = %s",
            (category_id,)
        )
        connection.commit()
        
        return jsonify({'message': 'Category deleted successfully'})
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Transactions routes
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    # Get query parameters for filtering
    category_id = request.args.get('category_id')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))
    offset = (page - 1) * limit
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Build query with filters
        query = """
            SELECT t.*, c.name as category_name, c.color as category_color 
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id 
            WHERE t.status = 'active'
        """
        params = []
        
        if category_id and category_id != 'all':
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
        
        # Convert Decimal to float for JSON serialization
        for transaction in transactions:
            if transaction['credited']:
                transaction['credited'] = float(transaction['credited'])
            if transaction['debited']:
                transaction['debited'] = float(transaction['debited'])
            if transaction['running_balance']:
                transaction['running_balance'] = float(transaction['running_balance'])
        
        # Get total count for pagination
        count_query = query.replace("SELECT t.*, c.name as category_name, c.color as category_color", "SELECT COUNT(*)")
        count_query = count_query.split("ORDER BY")[0]  # Remove ORDER BY and LIMIT
        cursor.execute(count_query, params[:-2])  # Remove limit and offset params
        total_count = cursor.fetchone()['COUNT(*)']
        
        return jsonify({
            'transactions': transactions,
            'total_count': total_count,
            'page': page,
            'limit': limit
        })
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    
    required_fields = ['transaction_date', 'category_id', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Calculate running balance
        cursor.execute("SELECT COALESCE(SUM(credited - debited), 0) as balance FROM transactions WHERE status = 'active'")
        current_balance = float(cursor.fetchone()[0])
        
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        new_balance = current_balance + credited - debited
        
        # Insert transaction
        cursor.execute("""
            INSERT INTO transactions 
            (transaction_date, category_id, description, credited, debited, running_balance, tags, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['transaction_date'],
            data['category_id'],
            data['description'],
            credited,
            debited,
            new_balance,
            data.get('tags', ''),
            data.get('notes', '')
        ))
        
        transaction_id = cursor.lastrowid
        connection.commit()
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            'transactions',
            transaction_id,
            'INSERT',
            '{}',
            str(data)
        ))
        connection.commit()
        
        return jsonify({'message': 'Transaction added successfully', 'id': transaction_id}), 201
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    data = request.get_json()
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get old values for audit
        cursor.execute("SELECT * FROM transactions WHERE id = %s", (transaction_id,))
        old_transaction = cursor.fetchone()
        
        if not old_transaction:
            return jsonify({'message': 'Transaction not found'}), 404
        
        # Update transaction
        cursor.execute("""
            UPDATE transactions 
            SET transaction_date = %s, category_id = %s, description = %s, 
                credited = %s, debited = %s, tags = %s, notes = %s, updated_at = NOW()
            WHERE id = %s
        """, (
            data.get('transaction_date', old_transaction['transaction_date']),
            data.get('category_id', old_transaction['category_id']),
            data.get('description', old_transaction['description']),
            data.get('credited', old_transaction['credited']),
            data.get('debited', old_transaction['debited']),
            data.get('tags', old_transaction['tags']),
            data.get('notes', old_transaction['notes']),
            transaction_id
        ))
        
        # Recalculate running balances for all transactions
        cursor.execute("""
            SELECT id, credited, debited FROM transactions 
            WHERE status = 'active' 
            ORDER BY transaction_date, created_at
        """)
        
        balance = 0
        for transaction in cursor.fetchall():
            balance += float(transaction['credited']) - float(transaction['debited'])
            cursor.execute(
                "UPDATE transactions SET running_balance = %s WHERE id = %s",
                (balance, transaction['id'])
            )
        
        connection.commit()
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            'transactions',
            transaction_id,
            'UPDATE',
            str(dict(old_transaction)),
            str(data)
        ))
        connection.commit()
        
        return jsonify({'message': 'Transaction updated successfully'})
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Soft delete
        cursor.execute(
            "UPDATE transactions SET status = 'inactive', updated_at = NOW() WHERE id = %s",
            (transaction_id,)
        )
        connection.commit()
        
        # Add audit log
        cursor.execute("""
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            'transactions',
            transaction_id,
            'DELETE',
            '{}',
            '{"status": "inactive"}'
        ))
        connection.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'})
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Summary routes
@app.route('/api/summary', methods=['GET'])
def get_summary():
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    category_id = request.args.get('category_id')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Build query with filters
        query = """
            SELECT 
                COALESCE(SUM(credited), 0) as total_credited,
                COALESCE(SUM(debited), 0) as total_debited,
                COALESCE(SUM(credited) - SUM(debited), 0) as net_balance,
                COUNT(*) as transaction_count
            FROM transactions 
            WHERE status = 'active'
        """
        params = []
        
        if category_id and category_id != 'all':
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
        
        # Convert Decimal to float
        summary['total_credited'] = float(summary['total_credited'])
        summary['total_debited'] = float(summary['total_debited'])
        summary['net_balance'] = float(summary['net_balance'])
        
        return jsonify(summary)
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Chart data routes
@app.route('/api/charts/category-spending', methods=['GET'])
def get_category_spending():
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT c.name, c.color, COALESCE(SUM(t.debited), 0) as amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id AND t.status = 'active'
        """
        params = []
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " WHERE c.status = 'active' GROUP BY c.id, c.name, c.color HAVING amount > 0 ORDER BY amount DESC"
        
        cursor.execute(query, params)
        data = cursor.fetchall()
        
        # Convert Decimal to float
        for item in data:
            item['amount'] = float(item['amount'])
        
        return jsonify(data)
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

@app.route('/api/charts/monthly-trend', methods=['GET'])
def get_monthly_trend():
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                COALESCE(SUM(credited), 0) as credited,
                COALESCE(SUM(debited), 0) as debited
            FROM transactions 
            WHERE status = 'active' 
                AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month
        """
        
        cursor.execute(query)
        data = cursor.fetchall()
        
        # Convert Decimal to float
        for item in data:
            item['credited'] = float(item['credited'])
            item['debited'] = float(item['debited'])
        
        return jsonify(data)
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Export routes
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    category_id = request.args.get('category_id')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'message': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
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
        
        if category_id and category_id != 'all':
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
            # Convert Decimal to float
            transaction['credited'] = float(transaction['credited']) if transaction['credited'] else 0
            transaction['debited'] = float(transaction['debited']) if transaction['debited'] else 0
            transaction['running_balance'] = float(transaction['running_balance']) if transaction['running_balance'] else 0
            writer.writerow(transaction)
        
        response = app.response_class(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=transactions.csv'}
        )
        return response
    
    except Error as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)