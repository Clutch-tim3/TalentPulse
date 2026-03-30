FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Install all deps (including devDeps needed for tsc build)
COPY package*.json ./
RUN npm ci

# Generate Prisma client and build TypeScript
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Non-root user
RUN addgroup -S app && adduser -S app -G app && chown -R app /app
USER app

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:${PORT:-3000}/v1/health || exit 1

CMD ["node", "dist/server.js"]
