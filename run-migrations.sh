#!/bin/bash

echo "Running Prisma migrations manually..."

# Check if container is running
if ! docker ps | grep -q "smartfinance-api"; then
    echo "Error: smartfinance-api container is not running."
    exit 1
fi

# Run migrations
docker exec smartfinance-api npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
    echo "Restarting container..."
    docker compose restart app
else
    echo "Error: Migrations failed"
    exit 1
fi
