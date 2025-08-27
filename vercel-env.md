# 🚀 Vercel Deployment Environment Variables

## Required Environment Variables for Vercel

Set these environment variables in your Vercel project dashboard:

### Database
```
DATABASE_URL=postgres://username:password@your-neon-host/your-database?sslmode=require
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://lumpsum.in
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production
```

### Optional OAuth Providers
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Backend API URL (if using separate backend)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the exact names above
5. Set the environment to "Production" (and optionally "Preview" for staging)
6. Click "Save"

## Security Notes

- **NEXTAUTH_SECRET**: Generate a secure random string (32+ characters)
- **DATABASE_URL**: Keep your Neon database URL secure
- **OAuth Secrets**: Never commit these to version control

## Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET (for backend)
openssl rand -base64 32
```

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Ensure DATABASE_URL points to your Neon database
- [ ] Test database connection locally
- [ ] Deploy to Vercel
- [ ] Verify all features work in production
- [ ] Check database migrations are applied
- [ ] Test authentication flows
- [ ] Verify learning content is accessible
