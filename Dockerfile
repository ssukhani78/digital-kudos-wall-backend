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
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S node -u 1001 -G nodejs && \
    mkdir -p /home/node/.config/prisma-nodejs && \
    chown -R node:nodejs /home/node

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and migrations
COPY --chown=node:nodejs prisma/schema.prisma prisma/
COPY --chown=node:nodejs prisma/migrations prisma/migrations/

# Generate Prisma client
USER node
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder --chown=node:nodejs /app/dist ./dist

# Create data directory and set permissions
RUN mkdir -p /app/prisma && chown -R node:nodejs /app

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/index.js"] 