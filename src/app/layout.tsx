import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export const metadata: Metadata = {
  title: "REAPA — AI Assistant for Real Estate Agents",
  description: "Your personal AI assistant for real estate — leads, clients, tasks, compliance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang and dir are updated dynamically by I18nProvider via useEffect
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden">
        <I18nProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
