"use client";

import { isRecaptchaConfigured } from "@/lib/env.client";

interface RecaptchaBannerProps {
  className?: string;
}

export function RecaptchaBanner({ className = "" }: RecaptchaBannerProps) {
  if (isRecaptchaConfigured()) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-amber-600">⚠️</span>
        <span>
          reCAPTCHA not configured. Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> to your environment variables for enhanced security.
        </span>
      </div>
    </div>
  );
}