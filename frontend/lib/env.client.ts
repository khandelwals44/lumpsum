import { z } from "zod";

/**
 * Client-side environment variables schema.
 * Only NEXT_PUBLIC_* variables are allowed here.
 */
const ClientEnvSchema = z.object({
  // reCAPTCHA (optional in development)
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  
  // API configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
  
  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Node environment (build-time constant, safe for client)
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type ClientEnv = z.infer<typeof ClientEnvSchema>;

let cachedClientEnv: ClientEnv | null = null;

/**
 * Get client environment variables with safe parsing.
 * Never throws; returns partial data even if validation fails.
 */
function getClientEnv(): ClientEnv {
  if (cachedClientEnv) {
    return cachedClientEnv;
  }

  const parsed = ClientEnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    // In development, log warnings for missing optional keys
    if (process.env.NODE_ENV === "development") {
      const missingKeys = Object.keys(parsed.error.flatten().fieldErrors);
      console.warn(
        "⚠️ Missing optional client environment variables:",
        missingKeys.join(", ")
      );
    }
    
    // Return partial data with defaults
    cachedClientEnv = {
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: undefined,
      NEXT_PUBLIC_API_BASE_URL: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      NEXT_PUBLIC_GA_ID: undefined,
      NODE_ENV: "development" as const,
    };
  } else {
    cachedClientEnv = parsed.data;
  }

  return cachedClientEnv;
}

/**
 * Get reCAPTCHA site key safely.
 * Returns null if not configured, logs warning in development.
 */
export function getRecaptchaSiteKey(): string | null {
  const env = getClientEnv();
  const siteKey = env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!siteKey && process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured. " +
      "reCAPTCHA will be disabled. Add it to frontend/.env.local for local development."
    );
  }
  
  return siteKey || null;
}

/**
 * Get API base URL safely.
 * Returns empty string if not configured.
 */
export function getApiBaseUrl(): string {
  return getClientEnv().NEXT_PUBLIC_API_BASE_URL || "";
}

/**
 * Get app URL safely.
 * Returns empty string if not configured.
 */
export function getAppUrl(): string {
  return getClientEnv().NEXT_PUBLIC_APP_URL || "";
}

/**
 * Get Google Analytics ID safely.
 * Returns null if not configured.
 */
export function getGoogleAnalyticsId(): string | null {
  return getClientEnv().NEXT_PUBLIC_GA_ID || null;
}

/**
 * Check if running in development mode (client-safe)
 */
export function isDevelopment(): boolean {
  return getClientEnv().NODE_ENV === "development";
}

/**
 * Check if running in production mode (client-safe)
 */
export function isProduction(): boolean {
  return getClientEnv().NODE_ENV === "production";
}

/**
 * Check if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
  return getRecaptchaSiteKey() !== null;
}