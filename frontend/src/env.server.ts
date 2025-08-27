import 'server-only';

/**
 * Server Environment Utilities
 * 
 * Provides lazy runtime URL derivation from Vercel system environment variables
 * to avoid import-time validation that causes build failures in previews.
 */

export function getRuntimeBaseUrl(): string {
  const branch = process.env.VERCEL_BRANCH_URL;
  const vercel = process.env.VERCEL_URL;
  
  if (branch) return `https://${branch}`;
  if (vercel) return `https://${vercel}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  
  return 'http://localhost:3000';
}

export function getApiBaseUrl(): string {
  // Prefer same-origin for frontend → API calls; only use explicit env if provided
  return process.env.API_BASE_URL ?? getRuntimeBaseUrl();
}

export function getNextAuthUrl(): string {
  return getRuntimeBaseUrl();
}

// Required environment variables (validated at runtime, not import time)
export function getRequiredEnvVars() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return required;
}

// Optional environment variables
export function getOptionalEnvVars() {
  return {
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

// Environment validation (call this at runtime, not import time)
export function validateServerEnv() {
  try {
    getRequiredEnvVars();
    return true;
  } catch (error) {
    console.error('Server environment validation failed:', error);
    return false;
  }
}
