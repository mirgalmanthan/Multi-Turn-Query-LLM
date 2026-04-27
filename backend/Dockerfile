# Backend Dockerfile — Multi-Stage Build

# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer if package files unchanged)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile TypeScript → dist/
COPY tsconfig.json ./
COPY src/ ./src/
COPY server.ts ./
RUN npm run build

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Only install production dependencies in the final image
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from the build stage
COPY --from=builder /app/dist ./dist

# Never run as root
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
