/**
 * Server-only environment variables
 * 
 * This module contains environment variables that should NEVER be exposed to the client.
 * It uses the 'server-only' package to enforce server-side usage and Zod for validation.
 * 
 * IMPORTANT: These variables are only available in:
 * - API routes (/app/api/**)
 * - Server components
 * - Server actions
 * - Middleware
 * - getServerSideProps (Pages Router)
 * 
 * They will cause build errors if imported in client components.
 */

import 'server-only';
import { z } from 'zod';

// Server-only environment variable schema
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  
  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: z.string().min(1, 'RECAPTCHA_SECRET_KEY is required'),
  
  // JWT
  JWT_SECRET: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Configuration
  API_BASE_URL: z.string().optional(),
});

// Parse and validate environment variables
const parseServerEnv = () => {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`❌ Invalid server environment variables: ${missingVars}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const serverEnv = parseServerEnv();

// Type-safe environment variable access
export const getServerEnv = () => serverEnv;

// Individual exports for convenience
export const {
  DATABASE_URL,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  RECAPTCHA_SECRET_KEY,
  JWT_SECRET,
  NODE_ENV,
  API_BASE_URL,
} = serverEnv;

// Helper functions for common patterns
export const isProduction = NODE_ENV === 'production';
export const isDevelopment = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';

// Database configuration helper
export const getDatabaseConfig = () => ({
  url: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// NextAuth configuration helper
export const getNextAuthConfig = () => ({
  secret: NEXTAUTH_SECRET,
  url: NEXTAUTH_URL,
});

// OAuth configuration helper
export const getOAuthConfig = () => ({
  google: {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  },
});

// reCAPTCHA configuration helper
export const getRecaptchaConfig = () => ({
  secretKey: RECAPTCHA_SECRET_KEY,
});

// JWT configuration helper
export const getJWTConfig = () => ({
  secret: JWT_SECRET || NEXTAUTH_SECRET, // Fallback to NextAuth secret
});
