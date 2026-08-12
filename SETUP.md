# BuildTrack - Complete Setup & Troubleshooting Guide

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (running)
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Set up database (requires PostgreSQL running)
bash setup-db.sh

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Database Setup

### Automated Setup (Recommended)
```bash
bash setup-db.sh
```

This script:
1. Checks if PostgreSQL is installed and running
2. Creates the `buildtrack` user (password: `buildtrack_dev`)
3. Creates the `buildtrack` database
4. Initializes the database schema

### Manual Setup

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:**
Download from https://www.postgresql.org/download/windows/ and run the installer.

#### 2. Create Database and User
```bash
sudo -u postgres psql << EOF
CREATE USER buildtrack WITH PASSWORD 'buildtrack_dev';
CREATE DATABASE buildtrack OWNER buildtrack;
GRANT ALL PRIVILEGES ON DATABASE buildtrack TO buildtrack;
EOF
```

#### 3. Initialize Database Schema
```bash
npm run init-db --workspace=apps/api
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js (Node.js) + TypeScript
- **Database**: PostgreSQL 16
- **Package Manager**: npm workspaces

### Directory Structure
```
BuildTrack/
├── apps/
│   ├── web/                 # React frontend
│   │   └── src/
│   │       ├── App.tsx      # Main component
│   │       └── main.tsx     # Entry point
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── server.ts    # API server
│       │   └── db.ts        # Database connection
│       ├── sql/
│       │   └── 001_create_projects.sql  # Schema
│       └── scripts/
│           └── init-db.ts   # Database init script
├── docker-compose.yml       # PostgreSQL container config
└── setup-db.sh             # Database setup helper
```

## Feature: Create New Project

### Complete Flow

1. **Frontend** (Port 5173)
   - User clicks "New Project" button
   - Modal form opens
   - User enters: name, location, progress, budget, status
   - User clicks "Create Project"

2. **API Request** (Via Vite Proxy)
   - POST http://localhost:5173/api/projects (proxied to http://localhost:5000/api/projects)
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "name": "Project Name",
       "location": "Location",
       "progress": 25,
       "budget": 18500000,
       "status": "In Progress"
     }
     ```

3. **Backend** (Port 5000)
   - Express receives POST request
   - Validates input (required fields, progress 0-100, budget is number)
   - Inserts into PostgreSQL projects table
   - Returns inserted project with id and created_at

4. **Database** (Port 5432)
   - Executes INSERT statement
   - Returns new record
   - Project appears in database

5. **Frontend Response**
   - Modal closes
   - Form resets
   - Fetches /api/projects/stats to update statistics
   - Project list refreshes
   - Statistics display updates

## API Endpoints

### Health & Info
- `GET /api/health` - Server status

### Projects
- `GET /api/projects` - List all projects
  ```bash
  curl http://localhost:5000/api/projects
  ```

- `POST /api/projects` - Create new project
  ```bash
  curl -X POST http://localhost:5000/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","location":"Lagos","progress":25,"budget":18500000,"status":"In Progress"}'
  ```

### Statistics
- `GET /api/projects/stats` - Project statistics
  ```bash
  curl http://localhost:5000/api/projects/stats
  ```

### Database
- `POST /api/init-db` - Initialize database schema
  ```bash
  curl -X POST http://localhost:5000/api/init-db
  ```

## Troubleshooting

### Issue: "Failed to create project" error

**Symptom**: Frontend shows alert "Failed to create project"

**Solution**:

1. **Check PostgreSQL is running**
   ```bash
   npx tsx apps/api/src/db-test.ts
   ```
   
   If it fails with ECONNREFUSED:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql@16
   ```

2. **Check database is initialized**
   ```bash
   npm run init-db --workspace=apps/api
   ```

3. **Check API is running**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Check API logs**
   ```bash
   npm run dev:api
   ```

5. **Test API directly**
   ```bash
   curl -i -X POST http://localhost:5000/api/projects \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","location":"Lagos","progress":25,"budget":18500000,"status":"In Progress"}'
   ```

### Issue: Cannot connect to PostgreSQL

**Symptom**: Error "connect ECONNREFUSED ::1:5432"

**Solution**:
1. Verify PostgreSQL is installed: `which psql`
2. Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
3. Check PostgreSQL service status:
   ```bash
   # Ubuntu/Debian
   sudo systemctl status postgresql
   
   # macOS
   brew services list | grep postgres
   ```

4. Restart PostgreSQL:
   ```bash
   # Ubuntu/Debian
   sudo systemctl restart postgresql
   
   # macOS
   brew services restart postgresql@16
   ```

### Issue: Database doesn't exist

**Symptom**: Error "database 'buildtrack' does not exist"

**Solution**:
```bash
bash setup-db.sh
```

Or manually:
```bash
sudo -u postgres psql << EOF
CREATE DATABASE buildtrack OWNER buildtrack;
GRANT ALL PRIVILEGES ON DATABASE buildtrack TO buildtrack;
EOF
```

### Issue: Wrong password

**Symptom**: Error "password authentication failed for user 'buildtrack'"

**Solution**: 
1. Reset user password:
   ```bash
   sudo -u postgres psql << EOF
   ALTER USER buildtrack WITH PASSWORD 'buildtrack_dev';
   EOF
   ```

2. Make sure `.env` has correct DATABASE_URL:
   ```
   DATABASE_URL=postgresql://buildtrack:buildtrack_dev@localhost:5432/buildtrack
   ```

### Issue: Port 5432 already in use

**Symptom**: "Address already in use" when starting PostgreSQL

**Solution**:
1. Check what's using port 5432:
   ```bash
   lsof -i :5432
   ```

2. Either stop the conflicting service or change the port in `.env`:
   ```
   DATABASE_URL=postgresql://buildtrack:buildtrack_dev@localhost:5433/buildtrack
   ```

3. Update docker-compose.yml if using containers:
   ```yaml
   ports:
     - "5433:5432"
   ```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Start only frontend
npm run dev:web

# Start only backend
npm run dev:api

# Build frontend
npm run build

# Lint frontend
npm run lint --workspace=apps/web

# Initialize database
npm run init-db --workspace=apps/api

# Test database connection
npx tsx apps/api/src/db-test.ts
```

## Database Schema

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Status Values
- `In Progress` - Project is actively being worked on
- `On Track` - Project is meeting timeline/budget goals
- `Needs Attention` - Project has issues requiring immediate action
- `Completed` - Project is finished

## Testing Checklist

After setup, verify everything works:

```bash
# 1. Test database connection
npx tsx apps/api/src/db-test.ts
# Expected: Shows current database time

# 2. Test API health check
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"BuildTrack API is running",...}

# 3. Test empty projects list
curl http://localhost:5000/api/projects
# Expected: {"success":true,"projects":[]}

# 4. Test project creation
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","location":"Lagos","progress":25,"budget":18500000,"status":"In Progress"}'
# Expected: {"success":true,"project":{id:1,...}}

# 5. Test fetching projects
curl http://localhost:5000/api/projects
# Expected: Project appears in list

# 6. Test statistics
curl http://localhost:5000/api/projects/stats
# Expected: {"success":true,"stats":{total_projects:1,...}}

# 7. Test frontend
# Open http://localhost:5173
# Click "New Project"
# Fill in form
# Click "Create Project"
# Verify project appears in list and stats update
```

## Docker Setup (Alternative to Manual PostgreSQL)

If you have Docker installed:

```bash
# Start PostgreSQL in Docker
docker compose up -d

# Initialize database
npm run init-db --workspace=apps/api

# Verify
npx tsx apps/api/src/db-test.ts
```

## Production Deployment

Before deploying to production:

1. Update DATABASE_URL to production instance
2. Update API_PORT to accessible port
3. Run database migrations:
   ```bash
   NODE_ENV=production npm run init-db --workspace=apps/api
   ```
4. Build frontend:
   ```bash
   npm run build
   ```
5. Deploy built artifacts and API separately

## Getting Help

Check the logs:
```bash
# Frontend logs
npm run dev:web

# Backend logs
npm run dev:api

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log  # Ubuntu/Debian
brew services log postgresql@16                     # macOS
```

For more detailed information, see:
- [apps/api/API_SETUP.md](apps/api/API_SETUP.md) - API-specific setup
- [apps/web/README.md](apps/web/README.md) - Frontend-specific setup
