/**
 * Client Environment Utilities
 * 
 * Provides non-throwing public environment variables with safe defaults
 * to prevent build failures when optional values are missing.
 */

export function getRecaptchaSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? null;
  if (!key && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("reCAPTCHA site key missing; UI will disable captcha-dependent actions.");
  }
  return key;
}

export function getAppConfig() {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Lumpsum.in',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    debugSafe: process.env.NEXT_PUBLIC_DEBUG_SAFE === '1',
  };
}

export function getPublicEnvVars() {
  return {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: getRecaptchaSiteKey(),
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || null,
    ...getAppConfig(),
  };
}

// Client-safe environment validation (never throws)
export function validateClientEnv() {
  const vars = getPublicEnvVars();
  const warnings = [];

  if (!vars.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    warnings.push('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not set - captcha features disabled');
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('Client environment warnings:', warnings);
  }

  return { valid: true, warnings };
}
