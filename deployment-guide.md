# 🚀 Deployment Guide - Spend Tracker

This guide covers deploying the Spend Tracker application to various platforms and environments.

## 📋 Table of Contents

- [🏠 Local Development](#-local-development)
- [☁️ Cloud Deployment](#️-cloud-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Backend Deployment](#backend-deployment)
  - [Database Setup](#database-setup)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔧 Environment Configuration](#-environment-configuration)
- [📊 Monitoring & Analytics](#-monitoring--analytics)

## 🏠 Local Development

### Quick Start
```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/spend-tracker-app.git
cd spend-tracker-app

# Automated setup
./scripts/start.sh  # Linux/Mac
# OR
scripts\start.bat   # Windows
```

### Manual Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python setup_database.py
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## ☁️ Cloud Deployment

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
npm run build
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
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
```

#### Option 2: Netlify
```bash
# Build the app
cd frontend
npm run build

# Deploy via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  publish = "frontend/dist"
  command = "cd frontend && npm run build"

[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.herokuapp.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 3: AWS S3 + CloudFront
```bash
# Build the app
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

### Backend Deployment

#### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI and login
heroku login

# Create app
cd backend
heroku create your-app-name

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set FLASK_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Setup database
heroku run python setup_database.py
```

**Heroku Configuration** (`Procfile`):
```
web: gunicorn app:app
release: python setup_database.py
```

**Requirements for Heroku** (`runtime.txt`):
```
python-3.9.18
```

#### Option 2: Railway
```bash
# Connect Railway to GitHub repo
# Set environment variables in Railway dashboard:
# - SECRET_KEY
# - MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

# Deploy automatically via GitHub integration
```

#### Option 3: DigitalOcean App Platform
```yaml
# .do/app.yaml
name: spend-tracker-backend
services:
- name: api
  source_dir: backend
  github:
    repo: YOUR-USERNAME/spend-tracker-app
    branch: main
  run_command: gunicorn --worker-tmp-dir /dev/shm --config gunicorn_config.py app:app
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SECRET_KEY
    value: your-secret-key
    type: SECRET
  - key: FLASK_ENV
    value: production
databases:
- name: spend-tracker-db
  engine: MYSQL
  version: "8"
```

### Database Setup

#### Option 1: Managed MySQL Services

**AWS RDS:**
```bash
# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier spend-tracker-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password yourpassword \
    --allocated-storage 20
```

**Google Cloud SQL:**
```bash
# Create Cloud SQL instance
gcloud sql instances create spend-tracker-db \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1
```

**DigitalOcean Managed Database:**
```bash
# Create via DigitalOcean dashboard or API
doctl databases create spend-tracker-db \
    --engine mysql \
    --size db-s-1vcpu-1gb \
    --region nyc1
```

#### Option 2: Free Database Services

**PlanetScale (Recommended for development):**
```bash
# Sign up at planetscale.com
# Create database and get connection string
# Use in your .env file
```

**JawsDB (Heroku addon):**
```bash
# Automatically configured with Heroku
heroku addons:create jawsdb:kitefin
```

## 🐳 Docker Deployment

### Dockerfile - Backend
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### Dockerfile - Frontend
```dockerfile
# frontend/Dockerfile
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
```

### Docker Compose
```yaml
# docker-compose.yml
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
```

**Deploy with Docker:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
# Database
MYSQL_HOST=your-production-db-host
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=spend_tracker

# Flask
SECRET_KEY=your-very-secure-secret-key
FLASK_ENV=production
FLASK_DEBUG=False

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional
JWT_EXPIRATION_DAYS=7
MAX_CONTENT_LENGTH=16777216
```

**Frontend Environment:**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure secret keys
- [ ] Configure CORS properly
- [ ] Use environment variables for sensitive data
- [ ] Enable database SSL connections
- [ ] Set up proper firewall rules
- [ ] Use managed database services
- [ ] Enable backup and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting

## 📊 Monitoring & Analytics

### Error Tracking with Sentry

**Backend Integration:**
```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

**Frontend Integration:**
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Analytics with Google Analytics

```javascript
// Add to frontend/public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Health Checks

**Backend Health Endpoint:**
```python
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })
```

### Monitoring Dashboard

Consider setting up monitoring with:
- **Uptime monitoring**: Pingdom, UptimeRobot
- **Application monitoring**: New Relic, DataDog
- **Log aggregation**: Loggly, Papertrail
- **Performance monitoring**: Google PageSpeed Insights

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run all tests locally
- [ ] Update environment variables
- [ ] Test database migrations
- [ ] Build and test production bundle
- [ ] Review security settings

### Deployment
- [ ] Deploy database changes first
- [ ] Deploy backend API
- [ ] Deploy frontend application
- [ ] Test all functionality
- [ ] Monitor for errors

### Post-deployment
- [ ] Verify health endpoints
- [ ] Check error tracking
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Notify team of successful deployment

## 🆘 Troubleshooting

### Common Issues

**CORS Errors:**
```python
# Update Flask-CORS configuration
CORS(app, origins=['https://yourdomain.com'])
```

**Database Connection:**
```python
# Check connection settings and firewall rules
# Ensure SSL is properly configured for managed databases
```

**Build Failures:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Loading:**
```bash
# Verify .env file location and syntax
# Check deployment platform environment variable settings
```

---

For additional help, refer to the [main README](../README.md) or create an [issue](../../issues) in the repository.