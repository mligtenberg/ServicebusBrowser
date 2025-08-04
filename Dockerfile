# Use Node as the base image so we have Node for the API
FROM node:22-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Create app directory
WORKDIR /app

# Copy backend package files and install only production dependencies
COPY dist/apps/servicebus-browser-web-backend ./backend/
RUN cd backend && npm i --only=production

# Copy compiled Angular build into Nginx's web root
# Assumes your compiled SPA is in frontend/dist
COPY dist/apps/servicebus-browser-web-frontend/browser /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY dockercontainer/nginx.conf /etc/nginx/nginx.conf

# Make sure the Nginx run directory exists
RUN mkdir -p /var/run/nginx

# Expose HTTP port
EXPOSE 80

# Start the Node backend on port 3000 and Nginx in the foreground
# Nginx must run in the foreground (`daemon off;`) to keep the container alive
CMD node backend/main.js & nginx -g 'daemon off;'
