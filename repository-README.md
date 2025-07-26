# 💰 Spend Tracker - Full-Stack Finance Management App

<div align="center">

![Spend Tracker Logo](https://img.shields.io/badge/💰-Spend%20Tracker-blue?style=for-the-badge)

**A beautiful, full-featured personal finance tracking application**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://your-demo-url.com) • [📖 Documentation](./docs/) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

![Spend Tracker Screenshot](https://via.placeholder.com/800x400/667eea/white?text=Spend+Tracker+Demo)

</div>

## ✨ Features

### 🎯 Core Features
- ✅ **Add/Edit/Delete Transactions** - Complete CRUD operations with beautiful modal forms
- ✅ **Smart Categorization** - 15+ pre-built categories with custom colors and emojis
- ✅ **Advanced Filtering** - Filter by date ranges, categories, with quick filter buttons
- ✅ **Real-time Summary** - Live calculations of income, expenses, and net balance
- ✅ **CSV Export** - Download filtered transaction data
- ✅ **Visual Analytics** - Custom SVG charts for spending insights
- ✅ **Responsive Design** - Perfect on desktop, tablet, and mobile devices

### 🚀 Advanced Features (Database Ready)
- 🔐 **Multi-user Authentication** - JWT-based user management
- 🔄 **Recurring Transactions** - Automated recurring payments
- 🎯 **Budget Goals** - Set and track spending limits
- 🏷️ **Advanced Tagging** - Flexible tagging system
- 📊 **Audit Trail** - Complete change tracking
- 💱 **Multi-currency** - Support for different currencies
- 🗑️ **Soft Delete** - Recovery system for deleted items

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with Hooks and TypeScript
- **Plain CSS** - Custom styling without external UI libraries
- **Custom Charts** - SVG-based visualizations
- **Responsive Design** - Mobile-first approach

### Backend
- **Flask** - Lightweight Python web framework
- **MySQL** - Robust relational database
- **JWT Authentication** - Secure token-based auth
- **RESTful API** - Clean API design

### Development Tools
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Git** - Version control
- **Environment Variables** - Secure configuration

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ and pip
- **MySQL** 8.0+

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/spend-tracker-app.git
cd spend-tracker-app

# Run setup script
# Linux/Mac:
./scripts/start.sh

# Windows:
scripts\start.bat
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python setup_database.py

# Add demo data (optional)
python populate_demo_data.py

# Start Flask server
python app.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: MySQL on localhost:3306

## 📁 Project Structure

```
spend-tracker-app/
├── 🎨 frontend/               # React TypeScript application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.tsx          # Main application component
│   │   ├── App.css          # Custom styling
│   │   └── main.tsx         # Application entry point
│   └── package.json         # Frontend dependencies
├── 🔧 backend/               # Flask Python application
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   ├── setup_database.py    # Database initialization
│   ├── populate_demo_data.py # Sample data generator
│   ├── .env.example         # Environment configuration
│   └── database/
│       └── schema.sql       # Complete database schema
├── 📚 docs/                 # Documentation
├── 🔨 scripts/              # Setup and utility scripts
└── 📝 README.md            # You are here!
```

## 🎯 API Endpoints

### 📋 Transactions
```http
GET    /api/transactions      # Get filtered transactions
POST   /api/transactions      # Create new transaction
PUT    /api/transactions/:id  # Update transaction
DELETE /api/transactions/:id  # Delete transaction (soft)
```

### 🏷️ Categories
```http
GET    /api/categories        # Get all categories
POST   /api/categories        # Create new category
DELETE /api/categories/:id    # Delete category
```

### 📊 Analytics
```http
GET    /api/summary           # Transaction summary
GET    /api/charts/category-spending  # Category breakdown
GET    /api/charts/monthly-trend     # Monthly trends
```

### 📤 Export
```http
GET    /api/export/csv        # Export transactions as CSV
```

## 🗄️ Database Schema

The application includes a comprehensive database schema with 11 tables:

- **👥 users** - User management and authentication
- **🏷️ categories** - Transaction categories with colors and icons
- **💸 transactions** - Main transaction records with running balance
- **🔄 recurring_transactions** - Automated recurring payments
- **🎯 goals** - Budget goals and tracking
- **📝 audit_log** - Change tracking and audit trail
- **🏷️ tags** - Tag management system
- **💱 exchange_rates** - Multi-currency support
- **🗑️ trash_bin** - Soft-delete recovery system
- **🔐 user_sessions** - JWT session management

## 🎨 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard Overview
![Dashboard](https://via.placeholder.com/600x400/667eea/white?text=Dashboard+View)

### Add Transaction Modal
![Add Transaction](https://via.placeholder.com/600x400/4f46e5/white?text=Add+Transaction+Modal)

### Category Management
![Categories](https://via.placeholder.com/600x400/8b5cf6/white?text=Category+Management)

### Mobile Responsive
![Mobile View](https://via.placeholder.com/300x600/6366f1/white?text=Mobile+View)

</details>

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=spend_tracker

# Flask Configuration
SECRET_KEY=your-super-secret-key
FLASK_ENV=development

# Optional Settings
JWT_EXPIRATION_DAYS=7
MAX_CONTENT_LENGTH=16777216
```

## 🚀 Deployment

### Development
- Frontend: `npm start` (localhost:3000)
- Backend: `python app.py` (localhost:5000)

### Production
- Frontend: `npm run build` → Deploy to Netlify/Vercel
- Backend: Deploy to Heroku/DigitalOcean/AWS
- Database: Use managed MySQL service

See [deployment guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 📈 Roadmap

### Version 1.1
- [ ] Real-time charts with Chart.js
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] Advanced budget alerts

### Version 1.2
- [ ] Receipt scanning (OCR)
- [ ] Bank account integration
- [ ] Investment tracking
- [ ] Financial goal planning

### Version 2.0
- [ ] Machine learning insights
- [ ] Collaborative budgets
- [ ] API for third-party integrations
- [ ] Advanced reporting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

Found a bug? Have a feature idea? We'd love to hear from you!

- [🐛 Report a Bug](../../issues/new?template=bug_report.md)
- [✨ Request a Feature](../../issues/new?template=feature_request.md)
- [💬 Start a Discussion](../../discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [MySQL](https://www.mysql.com/) - Database
- [Inter Font](https://rsms.me/inter/) - Beautiful typography
- [Heroicons](https://heroicons.com/) - Icon inspiration

## 📞 Support

- 📖 [Documentation](./docs/)
- 💬 [Discussions](../../discussions)
- 📧 Email: support@spendtracker.dev
- 🐦 Twitter: [@SpendTracker](https://twitter.com/spendtracker)

---

<div align="center">

**Made with ❤️ for better financial management**

⭐ Star this repo if you find it helpful!

</div>