# 💰 Spend Tracker - Full-Stack Finance Management App

A comprehensive personal finance tracking application built with React (frontend), Flask (backend), and MySQL (database). Track your income, expenses, categorize transactions, view insightful charts, and manage your financial data with ease.

## 🌟 Features

### Core Features
- ✅ **Add Transactions** - Record income and expenses with detailed information
- ✅ **Category Management** - Organize transactions with custom categories and colors
- ✅ **Filter & Search** - Filter by date ranges, categories, and view summaries
- ✅ **Edit/Delete** - Modify or remove transactions with soft-delete functionality
- ✅ **Export Data** - Download transaction data as CSV files
- ✅ **Visual Analytics** - Pie charts for spending categories and monthly trends
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices

### Advanced Features (Built-in Support)
- 🚀 **User Authentication** - JWT-based authentication ready for multi-user support
- 🔄 **Recurring Transactions** - Set up automatic recurring payments (database ready)
- 🎯 **Budget Goals** - Set and track budget limits per category (database ready)
- 🏷️ **Tags System** - Add multiple tags to transactions for better organization
- 📊 **Audit Trail** - Track all changes to transactions with full audit logging
- 💱 **Multi-Currency** - Database support for different currencies and exchange rates
- 🗑️ **Trash Bin** - Soft-delete with recovery options

## 🛠️ Technology Stack

- **Frontend**: React 18 with plain CSS (no external UI libraries)
- **Backend**: Flask with Python
- **Database**: MySQL with comprehensive schema
- **Authentication**: JWT tokens (ready for implementation)
- **Charts**: Custom SVG-based visualizations

## 📋 Prerequisites

- Python 3.8+ 
- Node.js 16+
- MySQL 8.0+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd spend-tracker
```

### 2. Database Setup

1. **Install MySQL** and create a database:
```sql
CREATE DATABASE spend_tracker;
```

2. **Import the schema**:
```bash
mysql -u root -p spend_tracker < backend/database/schema.sql
```

3. **Configure environment variables** (create `backend/.env`):
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=spend_tracker
SECRET_KEY=your-secret-key-here
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will be available at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
spend-tracker/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── database/
│       └── schema.sql        # MySQL database schema
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionList.js
│   │   │   ├── TransactionSummary.js
│   │   │   ├── ChartsPanel.js
│   │   │   └── CategoryManager.js
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styling
│   │   └── index.js         # React entry point
│   └── package.json         # Node.js dependencies
└── README.md
```

## 🗄️ Database Schema

The application includes a comprehensive database schema with the following tables:

- **users** - User management and authentication
- **categories** - Transaction categories with colors and icons  
- **transactions** - Main transaction records with running balance
- **recurring_transactions** - Automated recurring payments
- **goals** - Budget goals and tracking
- **audit_log** - Change tracking and audit trail
- **tags** - Tag management system
- **transaction_tags** - Many-to-many relationship for transaction tags
- **exchange_rates** - Multi-currency support
- **trash_bin** - Soft-delete recovery system
- **user_sessions** - JWT session management

## 🎯 API Endpoints

### Transactions
- `GET /api/transactions` - Get filtered transactions
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Soft delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add new category
- `DELETE /api/categories/:id` - Delete category

### Summary & Analytics
- `GET /api/summary` - Get transaction summary
- `GET /api/charts/category-spending` - Category spending data
- `GET /api/charts/monthly-trend` - Monthly trend data

### Export
- `GET /api/export/csv` - Export transactions as CSV

### Authentication (Ready)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## 🎨 Features Walkthrough

### 1. Dashboard Overview
- Clean, modern interface with gradient backgrounds
- Summary cards showing total income, expenses, and net balance
- Quick access to all major functions

### 2. Transaction Management
- **Add transactions** with date, category, description, and amounts
- **Edit existing transactions** with pre-filled forms
- **Soft delete** with confirmation dialogs
- **Tags and notes** for additional context

### 3. Category System
- **Predefined categories** with emojis and colors
- **Custom categories** with color picker and icon selector
- **Category filtering** in sidebar
- **Visual category indicators** throughout the app

### 4. Filtering & Search
- **Date range filtering** with quick buttons (Today, Last 7 days, Last 30 days)
- **Category filtering** with visual indicators
- **Combined filters** for precise data analysis

### 5. Visual Analytics
- **Pie charts** for spending distribution by category
- **Bar charts** for monthly income/expense trends
- **Quick stats** with key financial metrics
- **Custom SVG charts** for lightweight, responsive visualization

### 6. Data Export
- **CSV export** with current filter settings
- **Formatted data** ready for spreadsheet analysis
- **Downloadable files** with proper naming

## 🔧 Development

### Adding New Features

1. **Database Changes**: Update `backend/database/schema.sql`
2. **Backend API**: Add new routes in `backend/app.py`
3. **Frontend Components**: Create/modify components in `frontend/src/components/`
4. **Styling**: Update `frontend/src/App.css`

### Customization

- **Colors**: Modify the CSS custom properties in `App.css`
- **Categories**: Add default categories in the database schema
- **Currency**: Change the currency format in the `formatCurrency` functions
- **Branding**: Update the app name and favicon in `index.html`

## 🚀 Production Deployment

### Backend Deployment
- Use a production WSGI server like Gunicorn
- Set up proper environment variables
- Configure database connection pooling
- Enable HTTPS and CORS properly

### Frontend Deployment
- Build the production bundle: `npm run build`
- Serve static files with nginx or similar
- Configure API proxy for production

### Database
- Use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
- Set up regular backups
- Configure proper user permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify database connection and schema
3. Ensure all dependencies are installed
4. Check that both frontend and backend servers are running

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for simplicity and usability
- Open source and community-driven

---

**Happy Finance Tracking! 💰📊**
