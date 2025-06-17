# Multi-stage build for Node.js Express backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for building
RUN npm ci

# Copy source code and Prisma files
COPY . .

# Generate Prisma client and build the application
RUN npx prisma generate && npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl tini

# Set working directory
WORKDIR /app

# Set up Prisma directory and permissions
RUN mkdir -p /home/node/.config/prisma-nodejs && \
    mkdir -p /app/prisma && \
    chown -R node:node /home/node /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    chown -R node:node /app/node_modules

# Copy Prisma schema and migrations
COPY --chown=node:node prisma/schema.prisma prisma/
COPY --chown=node:node prisma/migrations prisma/migrations/

# Switch to node user
USER node

# Generate Prisma client
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/index.js"] 