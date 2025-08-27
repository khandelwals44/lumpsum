# lumpsum.in - High-end Goal-based Mutual Fund Recommendation Platform

Transform your financial future with AI-powered mutual fund recommendations. Personalized investment plans, goal tracking, and expert insights.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Authentication**: NextAuth.js + Google OAuth
- **Security**: reCAPTCHA v3 + JWT
- **Deployment**: Vercel (Frontend) + Railway/Vercel (Backend)

## 📋 Prerequisites

- Node.js 18+ 
- npm 10+
- PostgreSQL database (Neon recommended)
- Google Cloud Console account
- Google reCAPTCHA account

## 🔧 Environment Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lumpsum-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example file and fill in your values:
   ```bash
   cp frontend/env.local.example frontend/.env.local
   ```

   **Required environment variables for `frontend/.env.local`:**
   
   ```env
   # Database (Server-only)
   DATABASE_URL=postgresql://username:password@localhost:5432/lumpsum_dev
   
   # NextAuth (Server-only)
   NEXTAUTH_SECRET=your-32-character-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Google OAuth (Server-only)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # reCAPTCHA
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   API_BASE_URL=http://localhost:3001
   ```

   **Optional variables:**
   ```env
   # JWT (Server-only, optional - falls back to NEXTAUTH_SECRET)
   JWT_SECRET=your-jwt-secret-key-here
   
   # Analytics (Client-safe)
   NEXT_PUBLIC_GA_ID=
   
   # Debug (Client-safe)
   NEXT_PUBLIC_DEBUG_SAFE=1
   DEBUG_SAFE=1
   
   # Server Configuration (Server-only)
   PORT=3001
   NODE_ENV=development
   ```

### Production/Preview Deployment

Set the same environment variables in **Vercel Project Settings → Environment Variables**:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the variables above with production values
4. Redeploy for changes to apply

**Reference**: [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)

### Generating Secrets

**NEXTAUTH_SECRET:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🛠️ Installation & Bootstrap

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Bootstrap environment (if script exists)**
   ```bash
   npm run bootstrap
   ```

3. **Set up environment variables** (see above)

## 🚀 Running Locally

### Development Mode

**Start both frontend and backend:**
```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000 (or 3001 if 3000 is busy)
- **Backend**: http://localhost:4000

**Start individually:**
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://yourdomain.com` (production)
6. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (production)

**Reference**: [NextAuth Google Provider Documentation](https://next-auth.js.org/providers/google)

### reCAPTCHA v3 Setup

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Choose reCAPTCHA v3
4. Add domains:
   - `localhost` (development)
   - `yourdomain.com` (production)
5. Copy the site key and secret key to your environment variables

## 🧹 Clean Caches (Fix Prisma/TypeScript/Next.js Drift)

If you encounter build issues or stale types:

```bash
# Clear all caches
rm -rf node_modules/.prisma frontend/.next frontend/node_modules/.prisma .next

# Regenerate Prisma client
cd frontend && npx prisma generate

# Type check
npx tsc --noEmit

# Build
npm run build
```

## 🗄️ Database

### Connection

The application uses **Neon PostgreSQL** with SSL required:
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Schema Management

**Prisma-first approach:**
```bash
# After schema changes
npx prisma migrate dev --name migration_name
npx prisma generate
```

**Database-first approach:**
```bash
# Pull schema from existing database
npx prisma db pull
npx prisma generate
```

### Seeding

**Run seed:**
```bash
cd frontend
npx prisma db seed
```

**Common pitfalls:**
- Use enum values (e.g., `Level.BEGINNER`) not strings for enum columns
- For `String[]` fields, pass arrays directly
- For `Json` fields, pass plain objects (no `JSON.stringify`)

## 📚 API Documentation

### Backend Swagger

**URL**: http://localhost:4000/docs

**Access**: Public (no authentication required for docs)

### Frontend API Routes

All API routes are in `frontend/app/api/` and follow Next.js App Router conventions.

**Protected routes** require authentication via NextAuth.js session.

## 🏗️ Build & Deploy

### Local Build

```bash
# Build both frontend and backend
npm run build

# Build individually
npm run build:frontend
npm run build:backend
```

**Pre-build hooks:**
- Environment variable validation
- Prisma client generation
- TypeScript type checking

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel automatically detects Next.js and builds
4. **Environment mapping**: Ensure all `NEXT_PUBLIC_*` variables are set

## 🧪 Navigation QA Checklist

Test these pages to ensure navigation works correctly:

- [ ] **Homepage** (`/`): Logo navigates to `/`, all menu items work
- [ ] **Sign In** (`/auth/signin`): Logo and menu navigation works
- [ ] **Sign Up** (`/auth/signup`): Logo and menu navigation works  
- [ ] **Learning Hub** (`/learning`): All navigation elements functional
- [ ] **Calculators** (`/calculators`): Menu navigation works
- [ ] **About** (`/about`): Logo and menu navigation works
- [ ] **Mobile menu**: Bottom navigation works on mobile devices

**Verification**: In browser DevTools, ensure Link-based transitions don't fully reload the page (client-side navigation).

## 🔒 Security Notes

### Environment Variables

- **NEVER commit** `.env*` files to version control
- Use `NEXT_PUBLIC_*` prefix **only** for client-safe variables
- Server-only variables: `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `RECAPTCHA_SECRET_KEY`
- Client-safe variables: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_API_BASE_URL`

### Secret Rotation

If any secrets are exposed:
1. **Immediately rotate** the exposed secret
2. **Update environment variables** in all environments
3. **Redeploy** applications
4. **Review logs** for unauthorized access

### Validation

The application validates environment variables at startup and fails fast with actionable error messages.

## 🐛 Troubleshooting

### Common Issues

**"Invalid client environment variables"**
- Check that all required `NEXT_PUBLIC_*` variables are set
- Ensure no server-only variables are used in client code

**Prisma type errors**
- Run `npx prisma generate` after schema changes
- Clear caches: `rm -rf node_modules/.prisma frontend/.next`

**Navigation not working**
- Ensure all links use Next.js `<Link>` components
- Check for z-index conflicts in CSS

**Build failures**
- Clear all caches and regenerate Prisma client
- Check TypeScript errors: `npx tsc --noEmit`

### Getting Help

1. Check the troubleshooting section above
2. Review environment variable setup
3. Clear caches and regenerate Prisma client
4. Check browser console for client-side errors
5. Review server logs for backend issues

## 📄 License

This project is proprietary software. All rights reserved.

---

**Disclaimer**: This platform provides investment recommendations for educational purposes only and does not constitute investment advice. Please consult with a financial advisor before making investment decisions.
