import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Helpers ──────────────────────────────────────────────────────────────
type WindowLike = { posthog?: { capture: ReturnType<typeof vi.fn> }; gtag?: ReturnType<typeof vi.fn> };

function setWindow(props: WindowLike) {
  (globalThis as unknown as Record<string, unknown>)["window"] = props;
}
function clearWindow() {
  delete (globalThis as unknown as Record<string, unknown>)["window"];
}

describe("lib/analytics — no window (SSR / node)", () => {
  beforeEach(clearWindow);
  afterEach(clearWindow);

  it("trackEvent does not throw without window", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    expect(() => trackEvent("test_event")).not.toThrow();
    expect(() => trackEvent("test_event", { key: "val" })).not.toThrow();
  });

  it("trackPageView does not throw without window", async () => {
    const { trackPageView } = await import("@/lib/analytics");
    expect(() => trackPageView("/home")).not.toThrow();
  });

  it("analytics object methods do not throw without window", async () => {
    const { analytics } = await import("@/lib/analytics");
    expect(() => analytics.leadQualified("hot")).not.toThrow();
    expect(() => analytics.copilotOpened()).not.toThrow();
    expect(() => analytics.copilotMessage("en")).not.toThrow();
    expect(() => analytics.languageChanged("en", "ru")).not.toThrow();
    expect(() => analytics.viewingScheduled()).not.toThrow();
    expect(() => analytics.taskCreated("high")).not.toThrow();
  });
});

describe("lib/analytics — window with posthog", () => {
  let captureMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    captureMock = vi.fn();
    setWindow({ posthog: { capture: captureMock } });
  });
  afterEach(clearWindow);

  it("trackEvent calls posthog.capture with event name only", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("lead_qualified");
    expect(captureMock).toHaveBeenCalledWith("lead_qualified", undefined);
  });

  it("trackEvent calls posthog.capture with properties", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("copilot_message_sent", { language: "ru" });
    expect(captureMock).toHaveBeenCalledWith("copilot_message_sent", { language: "ru" });
  });

  it("trackPageView delegates to trackEvent with $pageview", async () => {
    const { trackPageView } = await import("@/lib/analytics");
    trackPageView("/leads");
    expect(captureMock).toHaveBeenCalledWith("$pageview", { url: "/leads" });
  });

  it("analytics.leadQualified fires lead_qualified event", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.leadQualified("warm");
    expect(captureMock).toHaveBeenCalledWith("lead_qualified", { score: "warm" });
  });

  it("analytics.copilotOpened fires copilot_opened", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.copilotOpened();
    expect(captureMock).toHaveBeenCalledWith("copilot_opened", undefined);
  });

  it("analytics.copilotMessage fires with language", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.copilotMessage("es");
    expect(captureMock).toHaveBeenCalledWith("copilot_message_sent", { language: "es" });
  });

  it("analytics.languageChanged fires with from/to", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.languageChanged("en", "ru");
    expect(captureMock).toHaveBeenCalledWith("language_changed", { from: "en", to: "ru" });
  });

  it("analytics.viewingScheduled fires viewing_scheduled", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.viewingScheduled();
    expect(captureMock).toHaveBeenCalledWith("viewing_scheduled", undefined);
  });

  it("analytics.taskCreated fires with priority", async () => {
    const { analytics } = await import("@/lib/analytics");
    analytics.taskCreated("urgent");
    expect(captureMock).toHaveBeenCalledWith("task_created", { priority: "urgent" });
  });
});

describe("lib/analytics — window with gtag only", () => {
  let gtagMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gtagMock = vi.fn();
    setWindow({ gtag: gtagMock });
  });
  afterEach(clearWindow);

  it("trackEvent calls gtag with 'event' as first arg", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("viewing_scheduled");
    expect(gtagMock).toHaveBeenCalledWith("event", "viewing_scheduled", undefined);
  });

  it("trackEvent passes properties to gtag", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("language_changed", { from: "en", to: "es" });
    expect(gtagMock).toHaveBeenCalledWith("event", "language_changed", { from: "en", to: "es" });
  });
});
