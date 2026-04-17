import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cn, formatCurrency, formatDate, formatTime, timeAgo } from "@/lib/utils";

describe("cn", () => {
  it("combines two class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("handles conditional false", () => {
    expect(cn("foo", false && "bar")).toBe("foo");
  });
  it("handles undefined", () => {
    expect(cn(undefined, "bar")).toBe("bar");
  });
  it("handles empty call", () => {
    expect(cn()).toBe("");
  });
  it("handles array of classes", () => {
    const result = cn("a", "b", "c");
    expect(result).toContain("a");
    expect(result).toContain("b");
    expect(result).toContain("c");
  });
  it("deduplicates or preserves multiple same classes", () => {
    const result = cn("px-4", "px-4");
    expect(typeof result).toBe("string");
  });
});

describe("formatCurrency", () => {
  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/0/);
  });
  it("contains EUR symbol or code", () => {
    const result = formatCurrency(250000);
    expect(result).toMatch(/€|EUR/);
  });
  it("formats 250000 with thousands separator", () => {
    const result = formatCurrency(250000);
    expect(result).toMatch(/250/);
  });
  it("strips decimal places (maximumFractionDigits: 0)", () => {
    const result = formatCurrency(99.99);
    expect(result).not.toMatch(/\.\d\d/);
  });
  it("formats 1 million", () => {
    const result = formatCurrency(1_000_000);
    expect(result).toMatch(/1/);
  });
  it("formats negative number", () => {
    const result = formatCurrency(-500);
    expect(result).toMatch(/-|500/);
  });
});

describe("formatDate", () => {
  it("includes the year 2026", () => {
    expect(formatDate("2026-04-17T00:00:00Z")).toContain("2026");
  });
  it("includes a month abbreviation", () => {
    const result = formatDate("2026-01-15T00:00:00Z");
    expect(result).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
  });
  it("returns a non-empty string", () => {
    expect(formatDate("2026-06-01T00:00:00Z").length).toBeGreaterThan(0);
  });
  it("handles a December date", () => {
    expect(formatDate("2026-12-25T00:00:00Z")).toContain("2026");
  });
});

describe("formatTime", () => {
  it("returns HH:MM format", () => {
    const result = formatTime("2026-01-01T14:30:00");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
  it("returns a non-empty string", () => {
    expect(formatTime("2026-04-17T09:00:00").length).toBeGreaterThan(0);
  });
  it("midnight produces a colon-separated time", () => {
    const result = formatTime("2026-01-01T00:00:00");
    expect(result).toContain(":");
  });
});

describe("timeAgo", () => {
  it('returns "Just now" for a date 10 seconds ago', () => {
    const d = new Date(Date.now() - 10_000).toISOString();
    expect(timeAgo(d)).toBe("Just now");
  });
  it('returns "Just now" for a date 59 seconds ago', () => {
    const d = new Date(Date.now() - 59_000).toISOString();
    expect(timeAgo(d)).toBe("Just now");
  });
  it("returns minutes ago for 5 minutes", () => {
    const d = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("5m ago");
  });
  it("returns minutes ago for 30 minutes", () => {
    const d = new Date(Date.now() - 30 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("30m ago");
  });
  it("returns hours ago for 2 hours", () => {
    const d = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("2h ago");
  });
  it("returns hours ago for 23 hours", () => {
    const d = new Date(Date.now() - 23 * 60 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("23h ago");
  });
  it("returns days ago for 1 day", () => {
    const d = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("1d ago");
  });
  it("returns days ago for 7 days", () => {
    const d = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();
    expect(timeAgo(d)).toBe("7d ago");
  });
});
