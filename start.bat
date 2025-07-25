@echo off
echo 🚀 Starting Spend Tracker Development Environment
echo ==============================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup backend
echo.
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Setup database
echo 🗄️ Setting up database...
python setup_database.py

REM Start backend server
echo 🚀 Starting Flask backend server...
start "Backend Server" python app.py

REM Setup frontend
echo.
echo 🔧 Setting up frontend...
cd ..\frontend

REM Install Node dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Start frontend server
echo 🚀 Starting React frontend server...
start "Frontend Server" npm start

echo.
echo 🎉 Spend Tracker is now running!
echo ==============================================
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🗄️ Database: MySQL (localhost:3306)
echo.
echo Press any key to open the application in your browser...
pause
start http://localhost:3000