/**
 * Site configuration utilities
 * Provides consistent site URL handling for SEO, sitemaps, and metadata
 */

/**
 * Get the canonical site URL with trailing slash removed
 * Falls back to https://lumpsum.in if not configured
 */
export function getSiteUrl(): string {
  const siteUrl = process.env.SITE_URL || 'https://lumpsum.in';
  return siteUrl.replace(/\/$/, ''); // Remove trailing slash
}

/**
 * Get the full URL for a given path
 * @param path - The path to append to the site URL
 * @returns The full URL
 */
export function getFullUrl(path: string = ''): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Site configuration constants
 */
export const SITE_CONFIG = {
  name: 'Lumpsum.in',
  description: 'Smart financial planning and investment calculators for better wealth management',
  url: getSiteUrl(),
  ogImage: '/og-image.jpg', // TODO: Add default OG image
  twitterHandle: '@lumpsum_in', // TODO: Update with actual handle
} as const;
