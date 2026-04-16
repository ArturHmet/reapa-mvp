/**
 * REAPA Analytics abstraction
 * Wraps PostHog (primary) + GA4 (secondary)
 *
 * Setup:
 *   PostHog: set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST (https://eu.i.posthog.com)
 *   GA4:     set NEXT_PUBLIC_GA_MEASUREMENT_ID (format: G-XXXXXXXXXX)
 *
 * Free tiers:
 *   PostHog EU: 1M events/month free
 *   GA4: unlimited free
 */

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, properties?: EventProperties) {
  // PostHog
  if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p?: EventProperties) => void } }).posthog) {
    (window as unknown as { posthog: { capture: (e: string, p?: EventProperties) => void } }).posthog.capture(event, properties);
  }
  // GA4
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", event, properties);
  }
}

export function trackPageView(url: string) {
  trackEvent("$pageview", { url });
}

// REAPA-specific events
export const analytics = {
  leadQualified: (score: string) => trackEvent("lead_qualified", { score }),
  copilotOpened: () => trackEvent("copilot_opened"),
  copilotMessage: (language: string) => trackEvent("copilot_message_sent", { language }),
  languageChanged: (from: string, to: string) => trackEvent("language_changed", { from, to }),
  viewingScheduled: () => trackEvent("viewing_scheduled"),
  taskCreated: (priority: string) => trackEvent("task_created", { priority }),
};
