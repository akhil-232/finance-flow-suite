#!/bin/bash

echo "🚀 Organizing Spend Tracker files for GitHub repository..."
echo "==========================================================="

# Create the directory structure
echo "📁 Creating directory structure..."

mkdir -p spend-tracker-repo/{frontend,backend,docs,scripts,.github/workflows}
mkdir -p spend-tracker-repo/frontend/{src/components,public}
mkdir -p spend-tracker-repo/backend/{database}

echo "✅ Directory structure created!"

# Copy frontend files
echo "📱 Copying frontend files..."
cp src/App.tsx spend-tracker-repo/frontend/src/
cp src/App.css spend-tracker-repo/frontend/src/
cp src/main.tsx spend-tracker-repo/frontend/src/
cp index.html spend-tracker-repo/frontend/public/
cp frontend/package.json spend-tracker-repo/frontend/ 2>/dev/null || echo "⚠️  Create frontend/package.json manually"

# Copy backend files
echo "🔧 Copying backend files..."
cp backend/app.py spend-tracker-repo/backend/ 2>/dev/null || echo "⚠️  Create backend files manually"
cp backend/requirements.txt spend-tracker-repo/backend/ 2>/dev/null || echo "⚠️  Create requirements.txt manually"
cp backend/setup_database.py spend-tracker-repo/backend/ 2>/dev/null || echo "⚠️  Create setup_database.py manually"
cp backend/populate_demo_data.py spend-tracker-repo/backend/ 2>/dev/null || echo "⚠️  Create populate_demo_data.py manually"
cp backend/.env.example spend-tracker-repo/backend/ 2>/dev/null || echo "⚠️  Create .env.example manually"
cp backend/database/schema.sql spend-tracker-repo/backend/database/ 2>/dev/null || echo "⚠️  Create schema.sql manually"

# Copy documentation
echo "📚 Copying documentation..."
cp repository-README.md spend-tracker-repo/README.md
cp deployment-guide.md spend-tracker-repo/docs/DEPLOYMENT.md
cp setup-github-repo.md spend-tracker-repo/docs/SETUP.md

# Copy scripts
echo "🔨 Copying scripts..."
cp start.sh spend-tracker-repo/scripts/ 2>/dev/null || echo "⚠️  Create start.sh manually"
cp start.bat spend-tracker-repo/scripts/ 2>/dev/null || echo "⚠️  Create start.bat manually"

# Copy GitHub workflows
echo "⚙️  Copying GitHub workflows..."
cp github-workflows/ci.yml spend-tracker-repo/.github/workflows/

# Create .gitignore
echo "🚫 Creating .gitignore..."
cat > spend-tracker-repo/.gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.production
.env.development

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
backend/venv/
backend/env/
backend/ENV/
backend/env.bak/
backend/venv.bak/

# Flask
instance/
.webassets-cache

# Node.js
frontend/node_modules/
frontend/npm-debug.log*
frontend/yarn-debug.log*
frontend/yarn-error.log*
frontend/.pnpm-debug.log*

# React build
frontend/build/
frontend/dist/

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database backups
*.sql.backup
backup/
backups/

# Uploads
uploads/
attachments/

# Temporary files
.tmp/
temp/

# Coverage reports
htmlcov/
.coverage
.coverage.*
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Build artifacts
*.tar.gz
*.zip
EOF

# Create package.json for workspace
echo "📦 Creating root package.json..."
cat > spend-tracker-repo/package.json << 'EOF'
{
  "name": "spend-tracker-app",
  "version": "1.0.0",
  "description": "💰 Full-Stack Personal Finance Tracker - React + Flask + MySQL",
  "private": true,
  "scripts": {
    "install-frontend": "cd frontend && npm install",
    "install-backend": "cd backend && pip install -r requirements.txt",
    "start-frontend": "cd frontend && npm start",
    "start-backend": "cd backend && python app.py",
    "build-frontend": "cd frontend && npm run build",
    "setup-db": "cd backend && python setup_database.py",
    "demo-data": "cd backend && python populate_demo_data.py",
    "start": "concurrently \"npm run start-backend\" \"npm run start-frontend\"",
    "setup": "npm run install-frontend && npm run install-backend && npm run setup-db"
  },
  "keywords": [
    "finance",
    "expense-tracker",
    "react",
    "flask",
    "mysql",
    "personal-finance",
    "full-stack"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/spend-tracker-app.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR-USERNAME/spend-tracker-app/issues"
  },
  "homepage": "https://github.com/YOUR-USERNAME/spend-tracker-app#readme"
}
EOF

# Create LICENSE file
echo "📜 Creating LICENSE file..."
cat > spend-tracker-repo/LICENSE << 'EOF'
MIT License

Copyright (c) 2024 Spend Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create deployment files
echo "🚀 Creating deployment configuration files..."

# Vercel configuration
cat > spend-tracker-repo/frontend/vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend-url.herokuapp.com/api"
  }
}
EOF

# Netlify configuration
cat > spend-tracker-repo/frontend/netlify.toml << 'EOF'
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.herokuapp.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# Heroku Procfile
cat > spend-tracker-repo/backend/Procfile << 'EOF'
web: gunicorn app:app
release: python setup_database.py
EOF

# Runtime for Heroku
cat > spend-tracker-repo/backend/runtime.txt << 'EOF'
python-3.9.18
EOF

# Create Docker files
echo "🐳 Creating Docker configuration..."

# Backend Dockerfile
cat > spend-tracker-repo/backend/Dockerfile << 'EOF'
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
EOF

# Frontend Dockerfile
cat > spend-tracker-repo/frontend/Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Docker Compose
cat > spend-tracker-repo/docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MYSQL_HOST=db
      - MYSQL_USER=root
      - MYSQL_PASSWORD=rootpassword
      - MYSQL_DATABASE=spend_tracker
      - SECRET_KEY=your-secret-key
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=spend_tracker
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  mysql_data:
EOF

echo ""
echo "🎉 Repository organization complete!"
echo "==========================================================="
echo "📁 All files have been organized in: spend-tracker-repo/"
echo ""
echo "📋 Next steps:"
echo "1. 🌐 Create a new repository on GitHub: 'spend-tracker-app'"
echo "2. 📂 Copy all files from 'spend-tracker-repo/' to your new repository"
echo "3. 📝 Update README.md with your GitHub username"
echo "4. 🔧 Configure environment variables"
echo "5. 🚀 Push to GitHub and deploy!"
echo ""
echo "📖 For detailed instructions, see: docs/SETUP.md"
echo "🚀 For deployment guide, see: docs/DEPLOYMENT.md"
echo ""
echo "✨ Happy coding! Your Spend Tracker is ready for GitHub! ✨"