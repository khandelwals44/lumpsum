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
import { Home, Target, BarChart3, User, Calculator, BookOpen } from "lucide-react";
import { logEnvSummary, logConfig } from "@/lib/logSafe";
import { DebugWrapper } from "@/components/DebugWrapper";

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
    default: "lumpsum.in – High-end Goal-based Mutual Fund Recommendation Platform",
    template: "%s · lumpsum.in"
  },
  description:
    "Transform your financial future with AI-powered mutual fund recommendations. Personalized investment plans, goal tracking, and expert insights. Start your wealth journey today.",
  openGraph: {
    title: "lumpsum.in – Smart Mutual Fund Recommendations",
    description:
      "Transform your financial future with AI-powered mutual fund recommendations. Personalized investment plans, goal tracking, and expert insights.",
    url: "/",
    siteName: "lumpsum.in",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "lumpsum.in – Smart Mutual Fund Recommendations",
    description:
      "Transform your financial future with AI-powered mutual fund recommendations. Personalized investment plans, goal tracking, and expert insights.",
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

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Learning Hub", href: "/learning", icon: BookOpen },
  { name: "Calculators", href: "/calculators", icon: Calculator },
  { name: "About", href: "/about", icon: Target }
];

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
              "@type": "WebSite",
              name: "lumpsum.in",
              url: "https://www.lumpsum.in/",
              description: "High-end Goal-based Mutual Fund Recommendation Platform",
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
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <span className="font-bold text-xl">lumpsum.in</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>

                <div className="flex items-center space-x-3">
                  <AuthButtons />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 dark:bg-zinc-950/80 dark:border-zinc-800/50">
              <div className="flex justify-around py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex flex-col items-center space-y-1 p-2 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

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
