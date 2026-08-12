#!/bin/bash

# BuildTrack Database Setup Script
# This script sets up PostgreSQL and initializes the database schema

set -e

echo "=== BuildTrack Database Setup ==="
echo

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo
    echo "Installation instructions:"
    echo "- Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "- macOS: brew install postgresql@16"
    echo "- Windows: Download from https://www.postgresql.org/download/windows/"
    echo
    echo "After installing PostgreSQL, run this script again."
    exit 1
fi

echo "✓ PostgreSQL found"

# Check if PostgreSQL is running
if ! psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo "❌ PostgreSQL server is not running or not accessible"
    echo
    echo "Start PostgreSQL service:"
    echo "- Ubuntu/Debian: sudo systemctl start postgresql"
    echo "- macOS: brew services start postgresql@16"
    echo "- Windows: Use the PostgreSQL service manager"
    exit 1
fi

echo "✓ PostgreSQL server is running"
echo

# Create database user if not exists
echo "Setting up database user..."
psql -U postgres -c "CREATE USER buildtrack WITH PASSWORD 'buildtrack_dev';" 2>/dev/null || echo "  User 'buildtrack' already exists"

# Create database if not exists
echo "Setting up database..."
psql -U postgres -c "CREATE DATABASE buildtrack OWNER buildtrack;" 2>/dev/null || echo "  Database 'buildtrack' already exists"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE buildtrack TO buildtrack;" 2>/dev/null || true

echo
echo "✓ Database setup complete"
echo

# Now run the init-db script
echo "Initializing database schema..."
npm run init-db --workspace=apps/api

echo
echo "✅ All setup complete!"
echo
echo "To verify, run:"
echo "  npx tsx apps/api/src/db-test.ts"
echo
