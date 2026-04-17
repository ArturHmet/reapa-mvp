"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "reapa_cookie_consent";

export type ConsentState = "accepted" | "declined" | null;

export function CookieConsentBanner() {
  const [state, setState] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (!stored) {
      // Small delay so layout stabilises before showing banner
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    setState(stored);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setState("accepted");
    setVisible(false);
    // Dispatch event so analytics providers can activate
    window.dispatchEvent(new CustomEvent("reapa:consent", { detail: { accepted: true } }));
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setState("declined");
    setVisible(false);
    window.dispatchEvent(new CustomEvent("reapa:consent", { detail: { accepted: false } }));
  };

  if (!visible || state !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={[
        "fixed bottom-0 left-0 right-0 z-[100] px-4 py-4",
        "bg-gray-900/95 backdrop-blur-sm border-t border-gray-700",
        "md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-2xl md:border md:border-gray-700",
        "shadow-2xl",
        "animate-in slide-in-from-bottom-4 duration-300",
      ].join(" ")}
    >
      <p className="text-sm text-gray-200 mb-3">
        <span className="font-semibold text-white">🍪 Cookie notice</span>{" "}
        We use essential cookies to run REAPA and, with your consent, optional analytics
        cookies (PostHog EU) to improve the product. No ads, no data sales.{" "}
        <Link href="/privacy" className="text-indigo-400 underline text-xs">
          Privacy Policy
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Accept all
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-xl transition-colors"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}

/**
 * Read stored consent synchronously (safe for SSR — returns null).
 * Import in analytics providers to gate tracking activation.
 */
export function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentState | null;
}
