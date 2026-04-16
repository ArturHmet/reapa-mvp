"use client";
import { useEffect } from "react";

/**
 * PostHog provider — lazy-loads PostHog EU on client mount.
 * Place in RootLayout for app-wide tracking.
 */
export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
    if (!key) return; // PostHog not configured — skip silently

    import("posthog-js").then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: false, // enable manually per-component for GDPR compliance
      });
    });
  }, []);

  return null; // No visible output
}
