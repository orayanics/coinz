FROM oven/bun:1 AS build

WORKDIR /app

# Cache dependencies
COPY package.json bun.lock ./
COPY packages/server/package.json ./packages/server/package.json

RUN bun install

# Copy server sources
COPY packages/server ./packages/server

WORKDIR /app/packages/server

ENV NODE_ENV=production

RUN bunx --bun prisma generate

RUN bun run build

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/packages/server/server ./server

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]
