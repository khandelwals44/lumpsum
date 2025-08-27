# Deployment Environment Configuration

## Overview
This document provides complete guidance for setting up environment variables in Vercel for the lumpsum.in application.

## Environment Variables by Scope

### Production Environment Variables

#### Database Configuration (Server-only)
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:port/db?sslmode=require` | Production PostgreSQL database URL |

#### Authentication Configuration (Server-only)
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `NEXTAUTH_SECRET` | ✅ | 32+ char string | NextAuth secret key |
| `NEXTAUTH_URL` | ✅ | `https://yourdomain.com` | Production app URL |
| `GOOGLE_CLIENT_ID` | ✅ | `123456789-xxx.apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | `GOCSPX-xxxxxxxxxxxxxxxx` | Google OAuth client secret |
| `JWT_SECRET` | ⚠️ | 32+ char string | JWT secret (optional, falls back to NEXTAUTH_SECRET) |

#### Security Configuration
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `RECAPTCHA_SECRET_KEY` | ✅ | `6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | reCAPTCHA secret key |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | ✅ | `6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | reCAPTCHA site key |

#### API Configuration
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `API_BASE_URL` | ⚠️ | `https://api.yourdomain.com` | Backend API URL (optional) |
| `NEXT_PUBLIC_API_BASE_URL` | ⚠️ | `https://api.yourdomain.com` | Public API URL (optional) |

#### Analytics Configuration (Client-safe)
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_GA_ID` | ⚠️ | `G-XXXXXXXXXX` | Google Analytics ID |

#### Application Configuration (Client-safe)
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_APP_NAME` | ⚠️ | `Lumpsum.in` | Application name |
| `NEXT_PUBLIC_APP_VERSION` | ⚠️ | `1.0.0` | Application version |
| `NEXT_PUBLIC_APP_ENV` | ⚠️ | `production` | Environment identifier |

#### Debug Configuration
| Variable | Required | Format | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_DEBUG_SAFE` | ⚠️ | `0` | Disable debug logging in production |
| `DEBUG_SAFE` | ⚠️ | `0` | Disable server debug logging in production |

## Vercel Setup Instructions

### 1. Access Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for both **Production** and **Preview** environments

### 2. Required Variables Setup

#### Database
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### Authentication
```
NEXTAUTH_SECRET=your-32-character-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Security
```
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### 3. Optional Variables Setup

#### API Configuration
```
API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

#### Analytics
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Application
```
NEXT_PUBLIC_APP_NAME=Lumpsum.in
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

#### Debug (Production)
```
NEXT_PUBLIC_DEBUG_SAFE=0
DEBUG_SAFE=0
```

## Environment Scopes

### Production Environment
- **Scope**: Production deployments
- **Use**: Live application
- **Variables**: All required + production-specific values

### Preview Environment
- **Scope**: Preview deployments (PRs, branches)
- **Use**: Testing before production
- **Variables**: Same as production, but with test/staging values

## Security Best Practices

### 1. Secret Management
- ✅ Use Vercel's built-in secret management
- ✅ Never commit secrets to version control
- ✅ Rotate secrets regularly
- ❌ Don't use the same secrets across environments

### 2. Client vs Server Variables
- **Client-safe** (`NEXT_PUBLIC_*`): Embedded in client bundle, visible in browser
- **Server-only**: Only available on server, never exposed to client

### 3. Variable Validation
- All variables are validated at build time
- Missing required variables will cause build failures
- Invalid formats will be caught during validation

## Deployment Process

### 1. Initial Setup
```bash
# 1. Set all required environment variables in Vercel
# 2. Deploy to preview environment first
# 3. Test all functionality
# 4. Deploy to production
```

### 2. Environment Variable Changes
```bash
# 1. Update variables in Vercel dashboard
# 2. Redeploy application (changes apply to new deployments only)
# 3. Verify changes are working
```

### 3. Secret Rotation
```bash
# 1. Generate new secrets
# 2. Update in Vercel dashboard
# 3. Redeploy application
# 4. Verify new secrets are working
# 5. Remove old secrets
```

## Troubleshooting

### Common Issues

#### Build Failures
- **Missing required variables**: Check Vercel environment variables
- **Invalid formats**: Verify variable formats match requirements
- **Scope issues**: Ensure variables are set for correct environment

#### Runtime Errors
- **Authentication failures**: Check NEXTAUTH_SECRET and Google OAuth credentials
- **Database connection**: Verify DATABASE_URL format and connectivity
- **reCAPTCHA issues**: Ensure both site key and secret key are set

#### Client-side Errors
- **Missing NEXT_PUBLIC_ variables**: Check client-safe variables
- **API connection**: Verify NEXT_PUBLIC_API_BASE_URL

### Debug Commands

#### Local Development
```bash
# Check environment variables
npm run check:env

# Bootstrap missing files
npm run bootstrap:env

# Verify security
npm run verify:security
```

#### Production Debugging
```bash
# Check Vercel environment variables
vercel env ls

# Pull environment variables (for debugging)
vercel env pull .env.local

# Deploy with environment check
vercel --prod
```

## Vercel CLI Commands

### Environment Management
```bash
# List environment variables
vercel env ls

# Add environment variable
vercel env add DATABASE_URL production

# Remove environment variable
vercel env rm DATABASE_URL production

# Pull environment variables (creates .env.local)
vercel env pull .env.local
```

### Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --env production
```

## Monitoring and Alerts

### Environment Health Checks
- Monitor for missing required variables
- Alert on authentication failures
- Track database connection issues
- Monitor reCAPTCHA success rates

### Security Monitoring
- Monitor for exposed secrets
- Track authentication attempts
- Monitor API usage patterns
- Alert on suspicious activity

## Support

For environment variable issues:
1. Check this documentation
2. Verify Vercel environment variables
3. Run local validation: `npm run check:env`
4. Check build logs for specific errors
5. Contact support with error details

