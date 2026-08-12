# BuildTrack API Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

## Database Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL in Docker
docker compose up -d

# Initialize the database schema
npm run init-db --workspace=apps/api

# Verify connection
npx tsx apps/api/src/db-test.ts
```

### Option 2: Local PostgreSQL Installation

1. Install PostgreSQL:
```bash
# On Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# On macOS
brew install postgresql@16

# On Windows
# Download from https://www.postgresql.org/download/windows/
```

2. Start PostgreSQL service:
```bash
# On Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# On macOS
brew services start postgresql@16
```

3. Create database and user:
```bash
sudo -u postgres psql << EOF
CREATE USER buildtrack WITH PASSWORD 'buildtrack_dev';
CREATE DATABASE buildtrack OWNER buildtrack;
GRANT ALL PRIVILEGES ON DATABASE buildtrack TO buildtrack;
EOF
```

4. Initialize the database schema:
```bash
npm run init-db --workspace=apps/api
```

## Environment Configuration

The API uses the following environment variables (from `apps/api/.env`):

```env
DATABASE_URL=postgresql://buildtrack:buildtrack_dev@localhost:5432/buildtrack
PORT=5000
```

Update these values if using different credentials or connection parameters.

## Running the API

```bash
# Development mode (with auto-reload)
npm run dev:api

# Or from the api directory
cd apps/api
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
  - Required fields: `name`, `location`
  - Optional fields: `progress` (0-100), `budget` (number), `status` (string)
  
### Project Statistics
- `GET /api/projects/stats` - Get project statistics (totals, active count, etc.)

### Database Initialization
- `POST /api/init-db` - Initialize database schema (creates tables if they don't exist)

## Request Body Example

```json
{
  "name": "Modern 3-Bedroom Residence",
  "location": "Uyo, Akwa Ibom",
  "progress": 25,
  "budget": 18500000,
  "status": "In Progress"
}
```

## Troubleshooting

### "Failed to create project" error
1. Check if PostgreSQL is running:
   ```bash
   npx tsx apps/api/src/db-test.ts
   ```

2. Check if the projects table exists:
   ```bash
   npm run init-db --workspace=apps/api
   ```

3. Check API logs for detailed error messages:
   ```bash
   npm run dev:api
   ```

### Database Connection Issues
- Verify DATABASE_URL in `apps/api/.env`
- Ensure PostgreSQL is running and accessible on localhost:5432
- Check firewall rules if connecting remotely

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

## Testing the API

### Test with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Get all projects
curl http://localhost:5000/api/projects

# Get statistics
curl http://localhost:5000/api/projects/stats

# Create a project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Residence",
    "location": "Uyo, Akwa Ibom",
    "progress": 25,
    "budget": 18500000,
    "status": "In Progress"
  }'
```

## Development

### Linting
```bash
npm run lint --workspace=apps/api
```

### Building
```bash
npm run build --workspace=apps/api
```

## Production Deployment

Before deploying:
1. Set `DATABASE_URL` to production PostgreSQL instance
2. Update `PORT` if needed
3. Set `NODE_ENV=production`
4. Run database initialization on production database

```bash
NODE_ENV=production npm run init-db --workspace=apps/api
```
