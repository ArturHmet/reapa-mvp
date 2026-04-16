import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/rtl.css";
import { Sidebar } from "@/components/Sidebar";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { REAPACopilot } from "@/components/REAPACopilot";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang and dir updated dynamically by I18nProvider via useEffect
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden">
        <I18nProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
            {children}
          </main>
          <REAPACopilot />
        </I18nProvider>
      </body>
    </html>
  );
}
