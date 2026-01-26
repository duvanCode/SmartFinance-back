#!/bin/bash

echo "=== Checking Backend Container Logs ==="

# Show the last 100 lines of app logs
docker compose logs --tail=100 app | grep -E "(Entrypoint|Waiting|Database|Generating|Migration|Seed|Starting)"

echo ""
echo "=== Full Container Startup Logs ==="
docker compose logs app | head -50
