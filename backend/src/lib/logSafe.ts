/**
 * Secure logging utility for backend
 * Ensures sensitive data is never logged in production
 */

import { getServerEnv } from './env.server.js';

// Common secret keys that should be masked
const SECRET_KEYS = [
  'password',
  'secret',
  'token',
  'apikey',
  'apiKey',
  'Authorization',
  'Bearer',
  'clientSecret',
  'privateKey',
  'refreshToken',
  'accessToken',
  'sessionToken',
  'authToken',
  'jwt',
  'key',
  'credential',
  'signature',
  'hash',
  'salt',
  'nonce',
  'database',
  'db',
  'connection',
  'url'
];

// Debug mode flag
const DEBUG_SAFE = process.env.NODE_ENV === 'development' && 
  (process.env.DEBUG_SAFE === '1' || process.env.NODE_ENV === 'development');

type Maskable = string | number | boolean | null | undefined;

/**
 * Masks a value to show only the last 4 characters
 */
function maskValue(value: Maskable): Maskable {
  if (value == null) return value;
  const s = String(value);
  if (s.length <= 8) return "*****";
  const last4 = s.slice(-4);
  return `****-masked-${last4}`;
}

/**
 * Deep clones an object and masks sensitive values
 */
export function redact<T>(obj: T, customSecretKeys: string[] = []): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const allSecretKeys = [...SECRET_KEYS, ...customSecretKeys];
  const cloned = JSON.parse(JSON.stringify(obj));
  
  function maskObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(maskObject);
    }
    
    if (obj && typeof obj === 'object') {
      const masked: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSecret = allSecretKeys.some(secretKey => 
          lowerKey.includes(secretKey.toLowerCase())
        );
        
        if (isSecret && typeof value === 'string') {
          masked[key] = maskValue(value);
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = maskObject(value);
        } else {
          masked[key] = value;
        }
      }
      return masked;
    }
    
    return obj;
  }
  
  return maskObject(cloned);
}

/**
 * Logs environment variable summary (server-side)
 */
export function logEnvSummary(): void {
  if (!DEBUG_SAFE) return;
  
  const env = getServerEnv();
  const summary: Record<string, { value: string; status: string }> = {};
  
  // Log all environment variables with masking
  Object.entries(env).forEach(([key, value]) => {
    const maskedValue = maskValue(value as Maskable);
    const status = value ? '✅ Set' : '❌ Missing';
    summary[key] = { value: String(maskedValue), status };
  });
  
  console.group('🔒 Environment Variables (Server)');
  console.table(summary);
  console.groupEnd();
}

/**
 * Logs runtime configuration (non-sensitive)
 */
export function logConfig(): void {
  if (!DEBUG_SAFE) return;
  
  const config = {
    environment: process.env.NODE_ENV,
    debugMode: DEBUG_SAFE,
    features: {
      auth: {
        google: !!process.env.GOOGLE_CLIENT_ID,
        credentials: true,
        jwt: !!process.env.JWT_SECRET
      },
      recaptcha: !!process.env.RECAPTCHA_SECRET_KEY,
      database: {
        type: 'postgresql',
        connected: !!process.env.DATABASE_URL
      }
    },
    server: {
      port: process.env.PORT || 3001,
      cors: true,
      rateLimit: true
    }
  };
  
  console.group('⚙️ Server Configuration');
  console.log('Configuration:', redact(config));
  console.groupEnd();
}

/**
 * Safe console.log wrapper that redacts sensitive data
 */
export function logSafe(message: string, data?: any, customSecretKeys: string[] = []): void {
  if (!DEBUG_SAFE) return;
  
  if (data) {
    console.log(`🔒 ${message}`, redact(data, customSecretKeys));
  } else {
    console.log(`🔒 ${message}`);
  }
}

/**
 * Safe console.error wrapper that redacts sensitive data
 */
export function logError(message: string, error?: any, customSecretKeys: string[] = []): void {
  if (!DEBUG_SAFE) return;
  
  if (error) {
    console.error(`❌ ${message}`, redact(error, customSecretKeys));
  } else {
    console.error(`❌ ${message}`);
  }
}

/**
 * Safe console.warn wrapper that redacts sensitive data
 */
export function logWarning(message: string, data?: any, customSecretKeys: string[] = []): void {
  if (!DEBUG_SAFE) return;
  
  if (data) {
    console.warn(`⚠️ ${message}`, redact(data, customSecretKeys));
  } else {
    console.warn(`⚠️ ${message}`);
  }
}

/**
 * Logs authentication flow data safely
 */
export function logAuthFlow(step: string, data?: any): void {
  logSafe(`Auth Flow - ${step}`, data, ['token', 'refreshToken', 'accessToken', 'sessionToken', 'password']);
}

/**
 * Logs API request/response data safely
 */
export function logApiCall(method: string, url: string, data?: any): void {
  logSafe(`API ${method} ${url}`, data, ['token', 'authorization', 'apiKey', 'secret', 'password']);
}

/**
 * Logs database operations safely
 */
export function logDbOperation(operation: string, data?: any): void {
  logSafe(`DB ${operation}`, data, ['password', 'secret', 'token', 'connection', 'url']);
}

/**
 * Logs payment/integration data safely
 */
export function logPaymentFlow(step: string, data?: any): void {
  logSafe(`Payment Flow - ${step}`, data, ['token', 'secret', 'apiKey', 'privateKey', 'signature']);
}

/**
 * Logs user data safely (for debugging)
 */
export function logUserData(userId: string, data?: any): void {
  logSafe(`User ${userId}`, data, ['password', 'token', 'secret', 'refreshToken']);
}

// Export debug mode for conditional usage
export { DEBUG_SAFE };
