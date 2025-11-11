# Backend Dockerfile for JACS ShiftPilot
FROM node:20-alpine AS base

# Install necessary packages for Prisma
RUN apk add --no-cache openssl

# Development dependencies stage
FROM base AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Production dependencies stage
FROM base AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM base AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM base
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy production dependencies
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy application code
COPY . .

# Copy generated Prisma Client
COPY --from=build-env /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3001

# Copy start script
COPY start-production.sh ./
RUN chmod +x start-production.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with migrations
CMD ["sh", "./start-production.sh"]
