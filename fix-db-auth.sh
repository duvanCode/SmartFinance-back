#!/bin/bash

# Load .env variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

echo "--- SmartFinance DB Fix Utility ---"

# 1. Verify if container is running
if ! docker ps | grep -q "smartfinance-db"; then
    echo "Error: smartfinance-db container is not running."
    echo "Try: docker compose up -d db"
    exit 1
fi

echo "1. Checking environment inside container..."
docker exec smartfinance-db env | grep -E "POSTGRES|PGPORT"

echo ""
echo "2. Attempting to synchronize password for user '${DB_USER:-postgres}'..."
# We use 'postgres' as the maintenance DB to run the ALTER command
docker exec -it smartfinance-db psql -U ${DB_USER:-postgres} -d postgres -p ${DB_PORT:-5656} -c "ALTER USER ${DB_USER:-postgres} WITH PASSWORD '${DB_PASSWORD:-postgres}';"

if [ $? -eq 0 ]; then
    echo "SUCCESS: Password synchronized."
else
    echo "FAILED: Could not change password."
    echo "Tip: If the error is 'password authentication failed', try running this as the superuser:"
    echo "docker exec -it smartfinance-db psql -U postgres -d postgres -p ${DB_PORT:-5656} -c \"ALTER USER postgres WITH PASSWORD '${DB_PASSWORD:-postgres}';\""
fi

echo ""
echo "3. Restarting API to pick up changes..."
docker compose restart app

echo "Done. Check logs with: docker compose logs -f app"
