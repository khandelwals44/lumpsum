export function getRecaptchaSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? null;
  if (!key && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("reCAPTCHA site key missing; UI will disable captcha-dependent actions.");
  }
  return key;
}
