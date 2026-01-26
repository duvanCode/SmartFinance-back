#!/bin/sh
set -e

echo "--- SmartFinance Backend Entrypoint ---"

# Wait for DB to be ready
echo "Waiting for database at db:${DB_PORT:-5656}..."
max_attempts=30
attempt=0
while ! nc -z db ${DB_PORT:-5656}; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "Error: Database not available after $max_attempts attempts"
    exit 1
  fi
  sleep 1
done
echo "Database is up!"

# Generate Prisma Client
echo "Generating Prisma client..."
npx prisma generate || {
  echo "Error: Failed to generate Prisma client"
  exit 1
}

# Run migrations (always, not just in production)
echo "Running Prisma migrations..."
npx prisma migrate deploy || {
  echo "Error: Failed to run migrations"
  exit 1
}

echo "Migrations completed successfully!"

# Start the application
echo "Starting application..."
exec node dist/main.js
