# Elysia with Bun runtime

## Getting Started

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Database

To setup SQLite database run:

```bash
bun add prisma @types/node @types/better-sqlite3 --dev
bun add @prisma/client @prisma/adapter-better-sqlite3 dotenv
bunx --bun prisma init --datasource-provider sqlite --output ../src/generated/prisma
```

- Creates a prisma/ directory with a schema.prisma file containing your database connection and schema models
- Creates a .env file in the root directory for environment variables (DATABASE_URL is already set, you can change it if needed)
- Creates a prisma.config.ts file for Prisma configuration

Run migrations:

```bash
    bunx --bun prisma migrate dev --name init
    bunx --bun prisma generate
```

To start fresh with an empty database, you can reset it:

```bash
    bunx --bun prisma migrate reset
```

Seed the database:

```bash
    bunx --bun prisma db seed
```

## OpenAPI

To view the OpenAPI documentation, run the development server and navigate to
<http://localhost:3000/openapi>.
