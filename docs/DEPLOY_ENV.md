# Deployment Environment Variables

## Security Requirements

**IMPORTANT**: All secrets and sensitive environment variables must be set in platform secrets (Vercel/Actions) and never committed to the repository.

## Environment Variable Rules

### Client-Side Variables (Browser Visible)
Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser/client-side code:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_GA_ID`

### Server-Side Variables (Never Browser Visible)
All other environment variables are server-side only and must never be accessed from client code:
- `DATABASE_URL`
- `JWT_SECRET`
- `RECAPTCHA_SECRET_KEY`
- `SMTP_PASSWORD`
- `STRIPE_SECRET_KEY`

## Platform Configuration

### Vercel
Set environment variables in the Vercel dashboard under Project Settings > Environment Variables.

### GitHub Actions
Set secrets in the repository settings under Settings > Secrets and variables > Actions.

## Local Development
- Use `.env.local` for local development (already gitignored)
- Never commit `.env` files
- Use `.env.example` as a template for required variables

## Verification
The pre-push hook will verify that client code doesn't access server-side environment variables.