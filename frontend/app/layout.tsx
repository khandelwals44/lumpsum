import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsSlot } from "@/components/Analytics";
import { RegisterSW } from "@/components/RegisterSW";
import { AuthButtons } from "@/components/AuthButtons";
import { ClientSession } from "@/components/ClientSession";
import { Button } from "@/components/ui/button";
import { logEnvSummary, logConfig } from "@/lib/logSafe";
import { DebugWrapper } from "@/components/DebugWrapper";
import { getSiteUrl, SITE_CONFIG } from "@/lib/site";
import { DesktopNavigation, MobileNavigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Lumpsum.in – Smart Financial Planning & Investment Calculators",
    template: "%s | Lumpsum.in"
  },
  description: SITE_CONFIG.description,
  openGraph: {
    title: "Lumpsum.in – Smart Financial Planning & Investment Calculators",
    description: SITE_CONFIG.description,
    url: "/",
    siteName: SITE_CONFIG.name,
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumpsum.in – Smart Financial Planning & Investment Calculators",
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.twitterHandle
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  }
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Log environment and config in development
  if (typeof window !== 'undefined') {
    logEnvSummary();
    logConfig();
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
              description: SITE_CONFIG.description,
              logo: `${SITE_CONFIG.url}/logo.png`,
              sameAs: [
                `https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`,
                "https://linkedin.com/company/lumpsum-in"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
              description: SITE_CONFIG.description,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_CONFIG.url}/?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientSession>
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span className="font-bold text-xl">lumpsum.in</span>
                </Link>

                {/* Desktop Navigation */}
                <DesktopNavigation />

                <div className="flex items-center space-x-3">
                  <AuthButtons />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Mobile Navigation */}
            <MobileNavigation />

            <main className="container py-8 pb-20 md:pb-8">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-200/40 via-transparent to-violet-200/40 dark:from-indigo-500/10 dark:to-fuchsia-500/10" />
                {children}
              </div>
            </main>

            <footer className="border-t border-zinc-200/50 py-8 text-sm text-zinc-600 dark:border-zinc-800/50 dark:text-zinc-300">
              <div className="container flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} lumpsum.in</p>
                <p className="max-w-2xl">
                  Disclaimer: This platform provides investment recommendations for educational
                  purposes only and does not constitute investment advice. Please consult with a
                  financial advisor before making investment decisions.
                </p>
              </div>
            </footer>
            <AnalyticsSlot />
            <RegisterSW />
            <DebugWrapper />
          </ClientSession>
        </ThemeProvider>
      </body>
    </html>
  );
}
