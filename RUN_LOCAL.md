# 🚀 Lumpsum.in Local Development Guide

## Prerequisites

- **Node.js**: >= 18.18.0
- **npm**: >= 8.0.0
- **PostgreSQL**: Running instance (local or cloud)

## Environment Setup

### 1. Backend Environment (.env in backend/ directory)

Create `backend/.env` with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/lumpsum_db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"

# Optional Configuration
JWT_SECRET="optional-jwt-secret-32-chars"
API_BASE_URL="http://localhost:3001"
PORT="3001"
NODE_ENV="development"
DEBUG_SAFE="1"
```

### 2. Frontend Environment (.env.local in frontend/ directory)

Create `frontend/.env.local` with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/lumpsum_db"

# Optional Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="Lumpsum.in"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_ENV="development"
NEXT_PUBLIC_DEBUG_SAFE="1"
```

## Installation & Setup

### 1. Install Dependencies

```bash
# From repository root
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies  
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# From backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Optional: Seed database with initial data
npx prisma db seed
```

### 3. Development Servers

```bash
# Terminal 1: Start backend server
npm --prefix backend run dev
# Backend will be available at: http://localhost:3001

# Terminal 2: Start frontend server
npm --prefix frontend run dev
# Frontend will be available at: http://localhost:3000
```

## Build Commands

### Backend Build
```bash
cd backend
npm run build
```

### Frontend Build
```bash
cd frontend
npm run build
```

### Full Project Build
```bash
# From repository root
npm run build
```

## Troubleshooting

### NodeNext Module Resolution Issues

If you encounter TypeScript errors like:
- `TS2835: Relative import paths need explicit file extensions`
- `TS2307: Cannot find module`

**Solutions:**
1. **Always use `.js` extensions** in relative imports within TypeScript source files:
   ```typescript
   // ✅ Correct
   import { something } from './lib/helper.js';
   
   // ❌ Incorrect
   import { something } from './lib/helper';
   ```

2. **Verify package.json has `"type": "module"`** for ESM runtime

3. **Check file paths** - ensure the imported file exists at the specified path

4. **Clear TypeScript cache**:
   ```bash
   rm -rf .next dist node_modules/.cache
   npx tsc --noEmit
   ```

### Prisma Issues

If you encounter Prisma-related errors:

1. **Regenerate Prisma client**:
   ```bash
   cd backend && npx prisma generate
   cd ../frontend && npm run db:generate
   ```

2. **Reset database** (if needed):
   ```bash
   cd backend
   npx prisma db push --force-reset
   npx prisma db seed
   ```

### Environment Variable Issues

1. **Verify all required variables are set** in both `.env` files
2. **Check variable names** - ensure they match exactly
3. **Restart development servers** after changing environment variables

### Port Conflicts

If ports are already in use:

1. **Change backend port** in `backend/.env`:
   ```env
   PORT="3002"
   ```

2. **Update frontend configuration** to point to new backend port:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
   ```

## Security Verification

Run the security verification script to ensure everything is properly configured:

```bash
# From repository root
npm run verify:security
```

This will check:
- ✅ Environment variable usage
- ✅ TypeScript compilation
- ✅ ESLint rules
- ✅ Secret scanning
- ✅ Build verification

## Production Deployment

For production deployment, ensure:

1. **Environment variables** are set in your deployment platform
2. **Database migrations** are run: `npx prisma migrate deploy`
3. **Build commands** complete successfully
4. **Security verification** passes

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Node.js version: `node -v` (should be >= 18.18.0)
3. Check npm version: `npm -v` (should be >= 8.0.0)
4. Ensure all environment variables are properly set
5. Run security verification: `npm run verify:security`

