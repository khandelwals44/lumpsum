/**
 * Secure logging utility for frontend
 * Ensures sensitive data is never logged in client bundles
 */

import { getClientEnv } from './env.client';

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
  'nonce'
];

// Debug mode flag
const DEBUG_SAFE = process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_DEBUG_SAFE === '1' || process.env.DEBUG_SAFE === '1');

/**
 * Masks a value to show only the last 4 characters
 */
function maskValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  
  const str = String(value);
  if (str.length <= 4) return '*'.repeat(str.length);
  return '*'.repeat(str.length - 4) + str.slice(-4);
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
 * Logs environment variable summary (client-safe)
 */
export function logEnvSummary(): void {
  if (!DEBUG_SAFE) return;
  
  const env = getClientEnv();
  const summary: Record<string, { value: string; status: string }> = {};
  
  // Only log NEXT_PUBLIC_ variables for client safety
  Object.entries(env).forEach(([key, value]) => {
    const maskedValue = maskValue(value);
    const status = value ? '✅ Set' : '❌ Missing';
    summary[key] = { value: maskedValue, status };
  });
  
  console.group('🔒 Environment Variables (Client-Safe)');
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
      analytics: !!process.env.NEXT_PUBLIC_GA_ID,
      recaptcha: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      auth: {
        google: true, // Always enabled if configured
        credentials: true
      }
    },
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Lumpsum.in',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }
  };
  
  console.group('⚙️ Runtime Configuration');
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
  logSafe(`Auth Flow - ${step}`, data, ['token', 'refreshToken', 'accessToken', 'sessionToken']);
}

/**
 * Logs API request/response data safely
 */
export function logApiCall(method: string, url: string, data?: any): void {
  logSafe(`API ${method} ${url}`, data, ['token', 'authorization', 'apiKey', 'secret']);
}

/**
 * Logs form data safely
 */
export function logFormData(formName: string, data?: any): void {
  logSafe(`Form ${formName}`, data, ['password', 'confirmPassword', 'token', 'secret']);
}

// Export debug mode for conditional usage
export { DEBUG_SAFE };

