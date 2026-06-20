# Base stage with bun setup
FROM oven/bun:1.1.42-slim AS base
WORKDIR /app

# Production dependencies stage
FROM base AS prod-deps
COPY package.json bun.lockb ./
# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Build stage - install all dependencies and build
FROM base AS build
COPY package.json bun.lockb ./
# Install all dependencies (including dev dependencies)
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Final stage - combine production dependencies and build output
FROM oven/bun:1.1.42-alpine AS runner
WORKDIR /app
COPY --from=prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/dist ./dist

# Use the bun user from the image
USER bun

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["bun", "run", "dist/index.js"]
