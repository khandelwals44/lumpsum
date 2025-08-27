import { z } from "zod";

/**
 * Server-only environment variables schema.
 * These variables are never exposed to the client.
 */
const ServerEnvSchema = z.object({
  // NextAuth configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(10).optional(),
  
  // OAuth providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  
  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  
  // Database (optional during build, required at runtime)
  DATABASE_URL: z.string().min(1).optional(),
  
  // Node environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Vercel system environment variables
  VERCEL_URL: z.string().optional(),
  VERCEL_BRANCH_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
});

type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Get server environment variables with validation.
 * Throws with helpful error messages if required variables are missing.
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = ServerEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    // During build time, be more lenient with missing optional variables
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // For Vercel builds, provide defaults for optional variables
      const envWithDefaults = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        GITHUB_ID: process.env.GITHUB_ID || '',
        GITHUB_SECRET: process.env.GITHUB_SECRET || '',
        RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
        NODE_ENV: process.env.NODE_ENV || 'production',
        VERCEL_URL: process.env.VERCEL_URL || '',
        VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL || '',
        VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
      };
      
      cachedEnv = envWithDefaults as ServerEnv;
      return cachedEnv;
    }
    
    const missingKeys = Object.keys(parsed.error.flatten().fieldErrors);
    
    const errorMessage = `
🚨 Missing required environment variables:

${missingKeys.map(key => `  - ${key}`).join('\n')}

📝 To fix this:

LOCAL DEVELOPMENT:
  1. Copy frontend/env.local.example to frontend/.env.local
  2. Fill in the required values in frontend/.env.local
  3. Restart your development server

PRODUCTION:
  1. Set these variables in your platform's environment settings:
     - Vercel: Project Settings > Environment Variables
     - GitHub Actions: Repository Settings > Secrets and variables > Actions
  2. Redeploy your application

💡 Note: Never commit real values to version control!
    `.trim();

    throw new Error(errorMessage);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/**
 * Get the NextAuth URL, deriving it from Vercel environment variables if not explicitly set.
 * This function is Vercel-aware and handles preview deployments automatically.
 */
export function getNextAuthUrl(): string {
  const env = getServerEnv();
  
  // If NEXTAUTH_URL is explicitly set, use it
  if (env.NEXTAUTH_URL && env.NEXTAUTH_URL !== 'http://localhost:3000') {
    return env.NEXTAUTH_URL;
  }
  
  // For Vercel deployments, derive from system environment variables
  if (env.VERCEL_BRANCH_URL) {
    return `https://${env.VERCEL_BRANCH_URL}`;
  }
  
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  
  // Default for local development
  return "http://localhost:3000";
}

/**
 * Validate required environment variables at runtime.
 * Call this function when the app starts to ensure all required variables are present.
 */
export function validateRuntimeEnv(): void {
  const env = getServerEnv();
  
  // Check for required variables at runtime
  const requiredVars: Array<{ key: string; value: string | undefined; description: string }> = [
    { key: 'DATABASE_URL', value: env.DATABASE_URL, description: 'Database connection string' },
  ];
  
  const missing = requiredVars.filter(v => !v.value);
  
  if (missing.length > 0) {
    // For Vercel deployments, be more lenient with missing variables during build
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      console.warn('⚠️  Some environment variables are missing, but continuing for Vercel build...');
      return;
    }
    
    const errorMessage = `
🚨 Missing required runtime environment variables:

${missing.map(v => `  - ${v.key}: ${v.description}`).join('\n')}

📝 To fix this:

LOCAL DEVELOPMENT:
  1. Copy frontend/env.local.example to frontend/.env.local
  2. Fill in the required values in frontend/.env.local
  3. Restart your development server

PRODUCTION:
  1. Set these variables in your platform's environment settings:
     - Vercel: Project Settings > Environment Variables
     - GitHub Actions: Repository Settings > Secrets and variables > Actions
  2. Redeploy your application

💡 Note: Never commit real values to version control!
    `.trim();

    throw new Error(errorMessage);
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getServerEnv().NODE_ENV === "development";
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getServerEnv().NODE_ENV === "production";
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return getServerEnv().NODE_ENV === "test";
}