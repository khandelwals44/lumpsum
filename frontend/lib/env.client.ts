/**
 * Client-safe environment variables
 * 
 * This module contains ONLY environment variables that are safe to expose to the client.
 * It only exports variables prefixed with NEXT_PUBLIC_* and provides type safety.
 * 
 * IMPORTANT: These variables are available in:
 * - Client components
 * - Browser JavaScript
 * - Client-side API calls
 * 
 * They are bundled with the client code and visible in DevTools.
 * NEVER include secrets, API keys, or sensitive data here.
 */

import { z } from 'zod';

// Client-safe environment variable schema
// Only NEXT_PUBLIC_* variables are allowed
const clientEnvSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // reCAPTCHA (site key only - secret key is server-only)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  
  // NextAuth (URL only - secrets are server-only)
  // Note: NEXTAUTH_URL is server-only, not client-safe
  
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('Lumpsum.in'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_DEBUG_SAFE: z.string().optional(),
});

// Parse and validate environment variables
const parseClientEnv = () => {
  try {
    return clientEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
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
  NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_DEBUG_SAFE,
} = clientEnv;

// Helper functions for common patterns
export const isProduction = NEXT_PUBLIC_APP_ENV === 'production';
export const isDevelopment = NEXT_PUBLIC_APP_ENV === 'development';
export const isTest = NEXT_PUBLIC_APP_ENV === 'test';

// API configuration helper
export const getApiConfig = () => ({
  baseUrl: NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 10000,
});

// Analytics configuration helper
export const getAnalyticsConfig = () => ({
  gaId: NEXT_PUBLIC_GA_ID,
  enabled: isProduction && !!NEXT_PUBLIC_GA_ID,
});

// reCAPTCHA configuration helper (client-side only)
export const getRecaptchaConfig = () => ({
  siteKey: NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
});

// App configuration helper
export const getAppConfig = () => ({
  name: NEXT_PUBLIC_APP_NAME,
  version: NEXT_PUBLIC_APP_VERSION,
  environment: NEXT_PUBLIC_APP_ENV,
  isProduction,
  isDevelopment,
  isTest,
});

// NextAuth configuration helper (client-safe parts only)
// Note: NEXTAUTH_URL is server-only, not available on client
export const getNextAuthConfig = () => ({
  // Client doesn't need NEXTAUTH_URL
});

// Feature flags (client-safe)
export const getFeatureFlags = () => ({
  analytics: isProduction,
  recaptcha: !!NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  api: !!NEXT_PUBLIC_API_BASE_URL,
});
