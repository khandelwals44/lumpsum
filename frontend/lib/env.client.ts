/**
 * Client-safe environment variables
 * 
 * This module contains environment variables that are safe to expose to the client.
 * Only variables prefixed with NEXT_PUBLIC_ should be included here.
 * 
 * IMPORTANT: These variables are available in:
 * - Client components
 * - Browser JavaScript
 * - Static generation
 * 
 * They will be included in the client bundle, so never include secrets here.
 */

import { z } from 'zod';

// Client-safe environment variable schema
const clientEnvSchema = z.object({
  // reCAPTCHA (site key only - secret key is server-only)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  
  // NextAuth (URL only - secrets are server-only)
  NEXT_PUBLIC_NEXTAUTH_URL: z.string().url().optional(),
  
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Debug
  NEXT_PUBLIC_DEBUG_SAFE: z.string().optional(),
});

// Parse and validate environment variables
const parseClientEnv = () => {
  try {
    return clientEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
      throw new Error(`❌ Invalid client environment variables: ${missingVars}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const clientEnv = parseClientEnv();

// Type-safe environment variable access
export const getClientEnv = () => clientEnv;

// Individual exports for convenience
export const {
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_NEXTAUTH_URL,
  NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_DEBUG_SAFE,
} = clientEnv;

// reCAPTCHA configuration helper (client-side only)
export const getRecaptchaConfig = () => ({
  siteKey: NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
});

// App configuration helper
export const getAppConfig = () => ({
  name: NEXT_PUBLIC_APP_NAME || 'Lumpsum.in',
  version: NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: NEXT_PUBLIC_APP_ENV || 'development',
  apiBaseUrl: NEXT_PUBLIC_API_BASE_URL,
  debugSafe: NEXT_PUBLIC_DEBUG_SAFE === '1',
});
