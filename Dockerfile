# ==========================================
# Stage 1: Build the TypeScript application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies including devDependencies for building
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Runtime Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 3000

# Run the server
CMD ["node", "dist/server.js"]