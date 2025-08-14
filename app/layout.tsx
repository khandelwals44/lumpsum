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

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lumpsum.in"),
  title: {
    default: "lumpsum.in – Mutual Fund Calculators (EMI, SIP, Lumpsum, Goal Planner, FD, NPS)",
    template: "%s · lumpsum.in"
  },
  description:
    "Plan smarter wealth with beautiful, accurate calculators. EMI, SIP, Lumpsum, Goal Planner, FD, and NPS calculators. 100% client-side. No tracking.",
  openGraph: {
    title: "lumpsum.in – Mutual Fund Calculators",
    description:
      "Plan smarter wealth with beautiful, accurate calculators. EMI, SIP, Lumpsum, Goal Planner, FD, and NPS calculators.",
    url: "/",
    siteName: "lumpsum.in",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "lumpsum.in – Mutual Fund Calculators",
    description:
      "Plan smarter wealth with beautiful, accurate calculators. EMI, SIP, Lumpsum, Goal Planner, FD, and NPS calculators.",
    images: ["/og.png"]
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "lumpsum.in",
              url: "https://www.lumpsum.in/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.lumpsum.in/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientSession>
            <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="font-semibold">
                  lumpsum.in
                </Link>
                <nav className="flex items-center gap-3">
                  <Link
                    href="/about"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    About
                  </Link>
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    GitHub
                  </a>
                  <AuthButtons />
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="container py-8">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-200/40 via-transparent to-violet-200/40 dark:from-indigo-500/10 dark:to-fuchsia-500/10" />
                {children}
              </div>
            </main>
            <footer className="border-t border-zinc-200 py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <div className="container flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} lumpsum.in</p>
                <p className="max-w-2xl">
                  Disclaimer: This site provides calculators for educational purposes only and does
                  not constitute investment advice.
                </p>
              </div>
            </footer>
            <AnalyticsSlot />
            <RegisterSW />
          </ClientSession>
        </ThemeProvider>
      </body>
    </html>
  );
}
