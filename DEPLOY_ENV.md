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
| `NEXT_PUBLIC_APP_NAME` | ✅ | `Lumpsum.in` | Application name |
| `NEXT_PUBLIC_APP_VERSION` | ✅ | `1.0.0` | Application version |
| `NEXT_PUBLIC_APP_ENV` | ✅ | `production` | Environment identifier |

### Preview Environment Variables

Use the same variables as Production, but with preview-specific values:

| Variable | Preview Value | Notes |
|----------|---------------|-------|
| `NEXTAUTH_URL` | `https://your-preview-url.vercel.app` | Preview deployment URL |
| `DATABASE_URL` | Preview database URL | Use separate preview database |
| `NEXT_PUBLIC_APP_ENV` | `preview` | Environment identifier |

## Vercel Setup Instructions

### 1. Access Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for each environment (Production, Preview, Development)

### 2. Add Environment Variables

#### Production Environment
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Application
NEXT_PUBLIC_APP_NAME=Lumpsum.in
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production

# Optional
JWT_SECRET=your-jwt-secret
API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Preview Environment
```bash
# Same as production but with preview URLs
NEXTAUTH_URL=https://your-preview-url.vercel.app
NEXT_PUBLIC_APP_ENV=preview
DATABASE_URL=postgresql://user:pass@preview-host:port/preview-db?sslmode=require
```

### 3. Vercel CLI Usage

#### Install Vercel CLI
```bash
npm i -g vercel
```

#### Add Environment Variables
```bash
# Add to production
vercel env add DATABASE_URL production

# Add to preview
vercel env add DATABASE_URL preview

# Add to development
vercel env add DATABASE_URL development
```

#### List Environment Variables
```bash
# List all environments
vercel env ls

# List specific environment
vercel env ls production
```

#### Pull Environment Variables
```bash
# Pull all environment variables
vercel env pull .env.local
```

## Secrets Rotation Policy

### Rotation Schedule
- **Critical Secrets**: Every 90 days
  - `NEXTAUTH_SECRET`
  - `JWT_SECRET`
  - `GOOGLE_CLIENT_SECRET`
  - `RECAPTCHA_SECRET_KEY`

- **Database Credentials**: Every 180 days
  - `DATABASE_URL`

- **OAuth Client IDs**: Every 365 days
  - `GOOGLE_CLIENT_ID`

### Rotation Process

#### 1. Staging/Preview Rotation (First)
```bash
# 1. Update preview environment variables
vercel env add NEXTAUTH_SECRET preview
# Enter new secret

# 2. Test the application thoroughly
# 3. Verify all authentication flows work
# 4. Check database connections
# 5. Test reCAPTCHA functionality
```

#### 2. Production Rotation (After Testing)
```bash
# 1. Update production environment variables
vercel env add NEXTAUTH_SECRET production
# Enter new secret

# 2. Redeploy production
vercel --prod

# 3. Monitor for any issues
# 4. Verify all functionality works
```

#### 3. Cleanup Old Secrets
```bash
# Remove old secrets from Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env rm NEXTAUTH_SECRET preview
```

### Emergency Rotation
If secrets are compromised:

1. **Immediate Actions**:
   - Rotate all secrets immediately
   - Revoke OAuth credentials
   - Change database passwords
   - Update reCAPTCHA keys

2. **Investigation**:
   - Audit access logs
   - Check for unauthorized access
   - Review security measures

3. **Communication**:
   - Notify stakeholders
   - Update security documentation
   - Review incident response

## Security Best Practices

### 1. Secret Generation
```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET, JWT_SECRET
openssl rand -hex 32     # Alternative method
```

### 2. Environment Separation
- Use different databases for preview/production
- Use different OAuth applications for each environment
- Use different reCAPTCHA keys for each environment

### 3. Access Control
- Limit who can access Vercel environment variables
- Use team roles and permissions
- Audit access regularly

### 4. Monitoring
- Monitor for unauthorized access
- Set up alerts for failed deployments
- Track environment variable changes

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check environment variables are set
vercel env ls

# Verify required variables are present
vercel env pull .env.local
cat .env.local
```

#### 2. Authentication Issues
- Verify `NEXTAUTH_URL` matches deployment URL
- Check Google OAuth redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

#### 3. Database Connection Issues
- Verify `DATABASE_URL` format
- Check database accessibility
- Ensure SSL mode is configured

#### 4. reCAPTCHA Issues
- Verify site key and secret key match
- Check domain configuration in reCAPTCHA console
- Ensure keys are for correct environment

### Debug Commands
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs your-deployment-url

# Check environment variables
vercel env ls

# Test local environment
vercel dev
```

## Support

For issues with:
- **Vercel Platform**: Contact Vercel support
- **Environment Variables**: Check this documentation
- **Application Logic**: Review application logs
- **Security Concerns**: Follow emergency rotation process

