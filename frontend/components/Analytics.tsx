"use client";

import Script from "next/script";
import { getGoogleAnalyticsId } from "@/lib/env.client";

/** Placeholder analytics slot. Set NEXT_PUBLIC_GA_ID to enable GA4. */
export function AnalyticsSlot() {
  const gaId = getGoogleAnalyticsId();
  if (!gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-setup" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
