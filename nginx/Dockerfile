FROM nginx:alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl

# Copy configuration and entrypoint
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

# Set permissions
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
