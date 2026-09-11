# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema
COPY prisma ./prisma/

# Copy server package files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci

# Copy server source
COPY server/tsconfig.json ./
COPY server/src ./src

# Generate Prisma Client & Build TypeScript
RUN npx prisma generate --schema=../prisma/schema.prisma
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY server/package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy built code from builder
COPY --from=builder /app/server/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
