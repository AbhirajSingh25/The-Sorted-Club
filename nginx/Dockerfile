# ==============================================================================
# The Sorted Club — Reverse Proxy Nginx Dockerfile
# ==============================================================================

FROM nginx:alpine

# Remove default configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy production reverse proxy configuration
COPY thesortedclub.conf /etc/nginx/conf.d/thesortedclub.conf

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
