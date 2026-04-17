import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/rtl.css";
import { ConditionalSidebar } from "@/components/ConditionalSidebar";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { REAPACopilot } from "@/components/REAPACopilot";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { GA4Script } from "@/components/analytics/GA4Script";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "REAPA — AI Assistant for Real Estate Agents",
  description: "Your personal AI assistant for real estate — leads, clients, tasks, compliance.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://reapa-mvp.vercel.app"),
  openGraph: {
    title: "REAPA — AI Assistant for Real Estate Agents",
    description: "Your personal AI assistant for real estate — leads, clients, tasks, compliance.",
    type: "website",
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
        <I18nProvider>
          <ToastProvider>
            <ConditionalSidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
              {children}
            </main>
            <REAPACopilot />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
