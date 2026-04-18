import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import "@/styles/rtl.css";
import { ConditionalSidebar } from "@/components/ConditionalSidebar";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { REAPACopilot } from "@/components/REAPACopilot";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { GA4Script } from "@/components/analytics/GA4Script";
import { ToastProvider } from "@/components/Toast";
import { PageViewTracker } from "@/lib/posthog";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://reapa-mvp.vercel.app";

export const metadata: Metadata = {
  title: "REAPA — AI Copilot for Real Estate Agents | Multilingual | Malta",
  description:
    "REAPA qualifies your leads, responds to clients in 10 languages, and saves every contact to your CRM dashboard automatically. Built for real estate agents in Malta and beyond. Free beta.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "REAPA — AI Copilot for Real Estate Agents",
    description:
      "Qualifies leads in English, Russian, Spanish. Auto-saves clients. Works 24/7 while you sleep. Free beta for Malta agents.",
    url: BASE_URL,
    siteName: "REAPA",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "REAPA — AI Copilot for Real Estate Agents",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "REAPA — AI Copilot for Real Estate Agents",
    description:
      "Qualifies leads in 3 languages. Auto-saves to CRM. 24/7. Free beta for Malta agents.",
    images: ["/og-image.png"],
  },
  keywords: [
    "AI real estate assistant",
    "real estate AI Malta",
    "property agent AI",
    "multilingual real estate AI",
    "real estate CRM AI",
    "AI property assistant",
    "Malta real estate technology",
    "REAPA",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // WCAG 1.4.4 — user must be able to resize text up to 200%
  userScalable: true,
  // MOB-002: enables env(safe-area-inset-*) on iOS notch / home-indicator devices
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang and dir updated dynamically by I18nProvider via useEffect
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden">
        <GA4Script />
        <PostHogProvider />
        {/* PageViewTracker fires $pageview on every route change via usePathname */}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <I18nProvider>
          <ToastProvider>
            <ConditionalSidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
              {children}
            </main>
            <ErrorBoundary label="REAPACopilot">
            <REAPACopilot />
          </ErrorBoundary>
          </ToastProvider>
        </I18nProvider>
        {/* GDPR cookie consent — renders client-side after hydration */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
