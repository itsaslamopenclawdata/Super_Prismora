# Development Stage
FROM node:22-alpine AS development

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]

# Production Stage
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all files
COPY . .

# Install all dependencies (including devDependencies for build)
COPY --from=dependencies /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
