#!/bin/sh

# Directory for certificates
CERTS_DIR="/etc/nginx/certs"
mkdir -p $CERTS_DIR

# Generate self-signed certificate if it doesn't exist
if [ ! -f "$CERTS_DIR/fullchain.pem" ] || [ ! -f "$CERTS_DIR/privkey.pem" ]; then
    echo "SSL Certificates not found. Generating self-signed certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERTS_DIR/privkey.pem" \
        -out "$CERTS_DIR/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
    echo "Self-signed certificates generated."
else
    echo "Using existing SSL certificates."
fi

# Execute the original Nginx command
exec nginx -g "daemon off;"
