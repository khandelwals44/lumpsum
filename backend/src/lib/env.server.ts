import 'dotenv/config';
import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RECAPTCHA_SECRET_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url().optional(),
  PORT: z.string().optional(),
});

const parseServerEnv = () => {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

export const serverEnv = parseServerEnv();
export const getServerEnv = () => serverEnv;

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
  PORT
} = serverEnv;

export const getRecaptchaConfig = () => ({ secretKey: RECAPTCHA_SECRET_KEY });
export const getNextAuthConfig = () => ({ 
  secret: NEXTAUTH_SECRET, 
  url: NEXTAUTH_URL 
});
export const getGoogleConfig = () => ({ 
  clientId: GOOGLE_CLIENT_ID, 
  clientSecret: GOOGLE_CLIENT_SECRET 
});
export const getDatabaseConfig = () => ({ url: DATABASE_URL });
export const getJwtConfig = () => ({ secret: JWT_SECRET || NEXTAUTH_SECRET });
export const isProduction = NODE_ENV === 'production';
export const isTest = NODE_ENV === 'test';

// Function version for compatibility
export function isDevelopment(): boolean {
  return getServerEnv().NODE_ENV === 'development';
}
