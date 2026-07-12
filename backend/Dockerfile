# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY src ./src

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only what's needed for production
RUN apk add --no-cache dumb-init openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S fleetflow -u 1001

# Copy built artifacts from builder
COPY --from=builder --chown=fleetflow:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fleetflow:nodejs /app/prisma ./prisma
COPY --from=builder --chown=fleetflow:nodejs /app/src ./src
COPY --chown=fleetflow:nodejs package*.json ./
COPY --chown=fleetflow:nodejs entrypoint.sh ./entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads && chown fleetflow:nodejs uploads

RUN chmod +x entrypoint.sh

USER fleetflow

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["./entrypoint.sh"]
