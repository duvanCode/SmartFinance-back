#!/bin/sh
set -e

echo "--- SmartFinance Backend Entrypoint ---"

# Wait for DB to be ready
echo "Waiting for database at db:${DB_PORT:-5656}..."
while ! nc -z db ${DB_PORT:-5656}; do
  sleep 1
done
echo "Database is up!"

# Generate Prisma Client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations in production (optional but recommended)
if [ "$NODE_ENV" = "production" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy
fi

# Start the application
echo "Starting application..."
exec node dist/main.js
