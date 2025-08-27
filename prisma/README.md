# Prisma Schema Location

⚠️ **IMPORTANT**: This directory is NOT the canonical Prisma schema location.

## Canonical Schema Location
The canonical Prisma schema is located at: `frontend/prisma/schema.prisma`

## Why This Directory Exists
This directory exists to prevent Prisma from accidentally discovering a schema file at the root level. The actual schema is in the frontend workspace.

## Usage
- Always use explicit schema paths: `--schema frontend/prisma/schema.prisma`
- Never run `prisma generate` without `--schema` flag
- All Prisma commands should specify the schema path explicitly

## Commands
```bash
# ✅ Correct - use explicit schema path
npx prisma generate --schema frontend/prisma/schema.prisma

# ❌ Wrong - don't rely on default discovery
npx prisma generate
```
