import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REAPA — AI Personal Assistant for Real Estate Agents | 10 Languages",
  description: "REAPA is the AI assistant built for real estate agents. Automate client communication, listing writing, lead follow-up in 10 languages. Join the waitlist free.",
  openGraph: {
    title: "Meet REAPA — AI That Works for Real Estate Agents 24/7",
    description: "Stop spending your day on admin. REAPA handles client messages, listing descriptions, lead follow-ups, and more — in 10 languages, 24/7.",
    images: ["/og-image.png"],
    siteName: "REAPA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REAPA — AI Personal Assistant for Real Estate Agents",
    description: "Stop spending your day on admin. REAPA handles client messages, listing descriptions, lead follow-ups, and more — in 10 languages, 24/7.",
  },
  keywords: ["AI assistant for real estate agents", "real estate AI tools", "multilingual real estate assistant", "automated lead follow-up real estate"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
