#!/bin/sh
set -e

echo "=== SmartFinance Backend Entrypoint ==="

# Configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES=30
RETRY_INTERVAL=2

# Wait for database to be ready
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
attempt=0
while ! nc -z "$DB_HOST" "$DB_PORT"; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $MAX_RETRIES ]; then
        echo "ERROR: Database not available after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "  Attempt $attempt/$MAX_RETRIES - Database not ready, retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
if npx prisma migrate deploy; then
    echo "Migrations completed successfully!"
else
    echo "ERROR: Failed to run migrations"
    exit 1
fi

# Start the application
echo "Starting NestJS application..."
exec node dist/main.js
