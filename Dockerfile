# ========================================
# Multi-stage Docker Build Configuration
# For PhotoIdentifier Platform
# ========================================

# Base image with common dependencies
FROM node:22-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Set default environment
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# ========================================
# Dependencies Stage
# ========================================
FROM base AS dependencies

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies based on environment
RUN if [ "$NODE_ENV" = "development" ]; then \
      npm ci; \
    else \
      npm ci --only=production && npm cache clean --force; \
    fi

# ========================================
# Development Stage
# ========================================
FROM dependencies AS development

ENV NODE_ENV=development

# Copy all source files
COPY . .

# Expose development port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# ========================================
# Builder Stage
# ========================================
FROM base AS builder

ENV NODE_ENV=production

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Remove development files to reduce image size
RUN rm -rf node_modules/.cache

# ========================================
# Production Stage
# ========================================
FROM base AS production

ENV NODE_ENV=production \
    PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy next.config.js if it exists
COPY --from=builder --chown=nextjs:nodejs /app/next.config*.js ./ 2>/dev/null || true

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "start"]

# ========================================
# Labels for metadata
# ========================================
LABEL maintainer="PhotoIdentifier Team" \
      org.opencontainers.image.title="PhotoIdentifier Platform" \
      org.opencontainers.image.description="AI-powered photo identification and management platform" \
      org.opencontainers.image.vendor="PhotoIdentifier" \
      org.opencontainers.image.version="1.0.0"
