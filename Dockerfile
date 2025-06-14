# Multi-stage Docker build for MERN app deployment to Google Cloud Run

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY client/ ./

# Build the React app for production
RUN npm run build

# Stage 2: Setup backend and serve the app
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Copy built frontend from the previous stage
COPY --from=frontend-builder /app/client/build ./public

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that Cloud Run expects
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "server.js"]
