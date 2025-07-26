# 💰 Spend Tracker - Full-Stack Finance Management App

<div align="center">

![Spend Tracker Logo](https://img.shields.io/badge/💰-Spend%20Tracker-blue?style=for-the-badge)

**A beautiful, full-featured personal finance tracking application**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://spend-tracker-demo.vercel.app) • [📖 Documentation](./docs/) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

## ✨ Features

### 🎯 Core Features
- ✅ **Complete CRUD Operations** - Add, edit, delete transactions with beautiful modal forms
- ✅ **Smart Categorization** - 15+ pre-built categories with custom colors and emojis
- ✅ **Advanced Filtering** - Filter by date ranges, categories, with quick filter buttons
- ✅ **Real-time Summary** - Live calculations of income, expenses, and net balance
- ✅ **CSV Export** - Download filtered transaction data
- ✅ **Visual Analytics** - Placeholder for charts and spending insights
- ✅ **Responsive Design** - Perfect on desktop, tablet, and mobile devices
- ✅ **Beautiful UI** - Modern design with smooth animations and transitions

### 🚀 Advanced Features (Database Ready)
- 🔐 **Multi-user Authentication** - JWT-based user management system
- 🔄 **Recurring Transactions** - Support for automated recurring payments
- 🎯 **Budget Goals** - Set and track spending limits by category
- 🏷️ **Advanced Tagging** - Flexible tagging system for transactions
- 📊 **Audit Trail** - Complete change tracking and history
- 💱 **Multi-currency** - Support for different currencies with exchange rates
- 🗑️ **Soft Delete** - Recovery system for deleted items
- 📈 **Performance Monitoring** - Built-in metrics and health checks

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with Hooks and TypeScript
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Plain CSS** - Custom styling with CSS variables and modern features
- **Responsive Design** - Mobile-first approach with CSS Grid and Flexbox

### Backend
- **Flask** - Lightweight Python web framework
- **MySQL** - Robust relational database with comprehensive schema
- **JWT Authentication** - Secure token-based authentication
- **Connection Pooling** - Efficient database connection management
- **RESTful API** - Clean, well-documented API endpoints

### Development Tools
- **ESLint & TypeScript** - Code quality and type checking
- **Python Virtual Environment** - Isolated dependency management
- **Environment Variables** - Secure configuration management
- **Comprehensive Logging** - Application monitoring and debugging

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **MySQL** 8.0+

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/spend-tracker-app.git
cd spend-tracker-app

# Run setup script
# Linux/Mac:
chmod +x scripts/start.sh
./scripts/start.sh

# Windows:
scripts\start.bat
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
python setup_database.py

# Add demo data (optional)
python populate_demo_data.py

# Start Flask server
python app.py
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
spend-tracker-app/
├── 🎨 frontend/               # React TypeScript application
│   ├── public/               # Static assets and HTML template
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── App.css          # Comprehensive styling
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── tsconfig.json        # TypeScript configuration
├── 🔧 backend/               # Flask Python application
│   ├── app.py               # Main Flask application with all routes
│   ├── requirements.txt     # Python dependencies
│   ├── setup_database.py    # Database initialization script
│   ├── populate_demo_data.py # Sample data generator
│   ├── .env.example         # Environment configuration template
│   └── database/
│       └── schema.sql       # Complete database schema (11 tables)
├── 📚 docs/                 # Documentation (created by script)
├── 🔨 scripts/              # Setup and utility scripts
├── 🔄 .github/workflows/     # CI/CD pipeline configuration
├── 📝 README.md            # This file
├── 📄 LICENSE              # MIT License
└── 🚫 .gitignore           # Git ignore rules
```

## 🎯 API Endpoints

### 📋 Transactions
- `GET /api/transactions` - Get filtered transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction (soft delete)

### 🏷️ Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `DELETE /api/categories/:id` - Delete category

### 📊 Analytics
- `GET /api/summary` - Transaction summary with filters
- `GET /api/charts/category-spending` - Category breakdown
- `GET /api/charts/monthly-trend` - Monthly spending trends

### 🔐 Authentication (Ready for Implementation)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /health` - Health check endpoint

### 📤 Export
- `GET /api/export/csv` - Export transactions as CSV

## 🗄️ Database Schema

The application includes a comprehensive database schema with 11 tables:

### Core Tables
- **👥 users** - User management and authentication
- **🏷️ categories** - Transaction categories with colors and icons
- **💸 transactions** - Main transaction records with running balance calculation
- **📊 audit_log** - Complete change tracking and audit trail

### Advanced Features Tables
- **🔄 recurring_transactions** - Automated recurring payments
- **🎯 goals** - Budget goals and spending limits
- **🏷️ tags** - Flexible tagging system
- **🔗 transaction_tags** - Many-to-many relationship for tags
- **💱 exchange_rates** - Multi-currency support
- **🗑️ trash_bin** - Soft-delete recovery system
- **🔐 user_sessions** - JWT session management

### Key Features
- **Foreign Key Constraints** - Referential integrity
- **Indexes** - Optimized query performance
- **Triggers** - Automatic audit logging
- **Stored Procedures** - Common operations
- **Views** - Simplified data access

## 🎨 UI Features

### 🎭 Beautiful Design
- **Modern Gradient Headers** - Eye-catching purple gradients
- **Card-based Layout** - Clean, organized interface
- **Smooth Animations** - CSS transitions and hover effects
- **Custom Icons** - Emoji-based category icons
- **Color-coded Data** - Income (green), expenses (red), balance (blue)

### 📱 Responsive Design
- **Mobile-first** - Optimized for all screen sizes
- **Flexible Grid** - CSS Grid and Flexbox layouts
- **Touch-friendly** - Large buttons and touch targets
- **Readable Typography** - Inter font with perfect scaling

### 🎪 Interactive Elements
- **Modal Forms** - Beautiful popup forms for transactions and categories
- **Advanced Filters** - Date ranges and category filtering
- **Real-time Updates** - Live balance calculations
- **Toast Messages** - Success and error notifications
- **Loading States** - Smooth loading indicators

## 🧪 Development Features

### 🔧 Developer Experience
- **TypeScript** - Full type safety
- **Hot Reload** - Instant development feedback
- **ESLint** - Code quality enforcement
- **Environment Variables** - Secure configuration
- **Comprehensive Logging** - Debugging and monitoring

### 🧪 Testing Ready
- **Vitest** - Modern testing framework
- **Testing Library** - Component testing utilities
- **Coverage Reports** - Code coverage tracking
- **CI/CD Pipeline** - GitHub Actions workflow

### 📊 Performance
- **Connection Pooling** - Efficient database connections
- **Code Splitting** - Optimized bundle sizes
- **Lazy Loading** - On-demand resource loading
- **Caching** - Browser and server-side caching

## 🚀 Deployment Options

### Frontend Deployment
- **Vercel** - Recommended for React apps
- **Netlify** - Simple static site deployment
- **AWS S3 + CloudFront** - Scalable cloud hosting

### Backend Deployment
- **Heroku** - Easy Python app deployment
- **Railway** - Modern cloud platform
- **DigitalOcean** - VPS hosting
- **AWS EC2** - Full control hosting

### Database Options
- **PlanetScale** - Serverless MySQL platform
- **AWS RDS** - Managed database service
- **Google Cloud SQL** - Reliable cloud database
- **Local MySQL** - Development and testing

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=spend_tracker

# Flask Configuration
SECRET_KEY=your-secret-key
FLASK_ENV=development

# Optional Features
JWT_EXPIRATION_DAYS=7
CORS_ORIGINS=http://localhost:3000
```

## 📈 Roadmap

### Phase 1 - Core Features ✅
- [x] Transaction CRUD operations
- [x] Category management
- [x] Advanced filtering
- [x] CSV export
- [x] Responsive design
- [x] Beautiful UI

### Phase 2 - Enhanced Features 🚧
- [ ] Real charts with Chart.js/D3
- [ ] User authentication implementation
- [ ] Budget goals tracking
- [ ] Recurring transactions
- [ ] Advanced analytics

### Phase 3 - Advanced Features 🔮
- [ ] Multi-currency support
- [ ] Receipt scanning (OCR)
- [ ] Mobile app (React Native)
- [ ] Bank account integration
- [ ] Investment tracking

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for functions
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check MySQL service
sudo systemctl status mysql

# Verify credentials in .env file
cat backend/.env
```

**Frontend Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use**
```bash
# Kill process on port 3000 or 5000
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [MySQL](https://www.mysql.com/) - Database
- [Inter Font](https://rsms.me/inter/) - Beautiful typography
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

- 📖 [Documentation](./docs/)
- 💬 [Discussions](../../discussions)
- 🐛 [Issues](../../issues)
- 📧 Email: support@spendtracker.dev

---

<div align="center">

**Made with ❤️ for better financial management**

⭐ Star this repo if you find it helpful!

[🚀 Get Started](#-quick-start) • [📖 Read Docs](./docs/) • [🤝 Contribute](#-contributing)

</div>
