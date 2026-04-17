"use client";
/**
 * REAPA PostHog client helpers.
 * All functions are safe no-ops when NEXT_PUBLIC_POSTHOG_KEY is not set
 * (key is bundled at build time; a new deploy is required after key is added to Vercel).
 */
import posthogJs from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Fire a custom event. Safe to call before posthog.init() — events queue internally. */
export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try { posthogJs.capture(event, properties); } catch { /* posthog not ready */ }
}

/** Identify authenticated user after Supabase session is confirmed. */
export function identifyUser(user: { id: string; email?: string; full_name?: string }) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthogJs.identify(user.id, {
      email:     user.email,
      name:      user.full_name,
      $set_once: { first_seen_at: new Date().toISOString() },
    });
  } catch { /* posthog not ready */ }
}

/**
 * PageViewTracker — fires $pageview on every route change.
 * Must be wrapped in <Suspense fallback={null}> in layout.tsx
 * because useSearchParams() requires it in Next.js 16.
 */
export function PageViewTracker() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    try {
      posthogJs.capture("$pageview", { $current_url: window.location.href });
    } catch { /* posthog not ready */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
