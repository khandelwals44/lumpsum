# Lumpsum.in Frontend

Next.js frontend application for the Lumpsum.in platform.

## Prisma Database Management

### For Contributors

After database schema changes:
1. Run `npm run prisma:pull` to sync with the database
2. Run `npm run prisma:generate` to regenerate the Prisma client
3. If types drift, run `npm run prisma:clean` to clear stale artifacts

### Commands

- `npm run prisma:generate` - Generate Prisma client from schema
- `npm run prisma:pull` - Pull database schema changes
- `npm run prisma:clean` - Clear stale Prisma artifacts
- `npm run db:seed` - Seed the database with initial data
