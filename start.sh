#!/bin/bash

echo "🚀 Starting Spend Tracker Development Environment"
echo "=============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

if ! command_exists mysql; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+"
    exit 1
fi

echo "✅ All prerequisites are installed"

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Setup database
echo "🗄️  Setting up database..."
python setup_database.py

# Start backend server in background
echo "🚀 Starting Flask backend server..."
python app.py &
BACKEND_PID=$!

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."
cd ../frontend

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start frontend server in background
echo "🚀 Starting React frontend server..."
npm start &
FRONTEND_PID=$!

# Wait a moment for servers to start
sleep 3

echo ""
echo "🎉 Spend Tracker is now running!"
echo "=============================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "🗄️  Database: MySQL (localhost:3306)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=============================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped successfully"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for background processes
wait