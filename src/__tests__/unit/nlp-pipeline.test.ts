/**
 * Unit tests — REAPA NLP Pipeline (Stages 1-4)
 * Coverage: language detection, intent classification, entity extraction, confidence scoring
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  classifyIntent,
  extractBudget,
  extractLocation,
  extractPropertyType,
  extractTimeline,
  extractBedrooms,
  scoreResult,
  runNLPPipeline,
} from "@/lib/ai/nlp-pipeline";

// Mock franc-min (ESM) — keeps tests sync and deterministic
vi.mock("franc-min", () => ({
  franc: (text: string): string => {
    if (/[а-яё]/i.test(text)) return "rus";
    if (/[ñáéíóúü¿¡]/i.test(text) || /\b(quiero|comprar|alquiler|alquilar|hola)\b/i.test(text)) return "spa";
    return "eng";
  },
}));

// ── Stage 1: Language Detection ────────────────────────────────────────────
describe("Stage 1 — detectLanguage", () => {
  it("detects English", async () => {
    const { detectLanguage } = await import("@/lib/ai/nlp-pipeline");
    expect(await detectLanguage("I want to buy an apartment in Sliema")).toBe("en");
  });

  it("detects Russian", async () => {
    const { detectLanguage } = await import("@/lib/ai/nlp-pipeline");
    expect(await detectLanguage("Хочу купить квартиру на Мальте")).toBe("ru");
  });

  it("detects Spanish", async () => {
    const { detectLanguage } = await import("@/lib/ai/nlp-pipeline");
    expect(await detectLanguage("Quiero comprar un apartamento en Malta")).toBe("es");
  });

  it("falls back gracefully for very short text", async () => {
    const { detectLanguage } = await import("@/lib/ai/nlp-pipeline");
    const result = await detectLanguage("hi");
    expect(["en", "other"]).toContain(result);
  });
});

// ── Stage 2: Intent Classification ────────────────────────────────────────
describe("Stage 2 — classifyIntent", () => {
  it("classifies buy (EN)", () => {
    const { intent, confidence } = classifyIntent("I want to buy a 2-bedroom apartment in Sliema");
    expect(intent).toBe("buy");
    expect(confidence).toBeGreaterThanOrEqual(25);
  });

  it("classifies sell", () => {
    expect(classifyIntent("I am looking to sell my villa in Mellieha").intent).toBe("sell");
  });

  it("classifies rent", () => {
    expect(classifyIntent("I need a rental apartment, monthly lease").intent).toBe("rent");
  });

  it("classifies buy (Russian)", () => {
    expect(classifyIntent("Хочу купить квартиру").intent).toBe("buy");
  });

  it("classifies buy (Spanish)", () => {
    expect(classifyIntent("Quiero comprar un piso en Malta").intent).toBe("buy");
  });

  it("returns other for unrecognised messages", () => {
    expect(classifyIntent("Hello there").intent).toBe("other");
  });
});

// ── Stage 3a: Budget Extraction ────────────────────────────────────────────
describe("Stage 3 — extractBudget", () => {
  it("extracts budget range (K notation)", () => {
    const r = extractBudget("My budget is €400K–€700K");
    expect(r).toBeDefined();
    expect(r?.min).toBe(400_000);
    expect(r?.max).toBe(700_000);
    expect(r?.confidence).toBeGreaterThanOrEqual(80);
  });

  it("extracts upper bound from 'under' pattern", () => {
    const r = extractBudget("looking for something under €500K");
    expect(r?.max).toBe(500_000);
  });

  it("extracts lower bound from 'over' pattern", () => {
    const r = extractBudget("We have over €1M to spend");
    expect(r?.min).toBeGreaterThanOrEqual(1_000_000);
  });

  it("returns undefined when no budget mentioned", () => {
    expect(extractBudget("I want a 2-bedroom apartment")).toBeUndefined();
  });
});

// ── Stage 3b: Location Extraction ─────────────────────────────────────────
describe("Stage 3 — extractLocation", () => {
  it("extracts Sliema", () => {
    const r = extractLocation("Looking for a property in Sliema");
    expect(r?.value.toLowerCase()).toBe("sliema");
    expect(r?.confidence).toBeGreaterThanOrEqual(90);
  });

  it("extracts Gozo", () => {
    expect(extractLocation("We are interested in Gozo properties")?.value.toLowerCase()).toBe("gozo");
  });

  it("returns undefined for unknown location", () => {
    expect(extractLocation("I want a nice flat")).toBeUndefined();
  });
});

// ── Stage 3c: Timeline Extraction ─────────────────────────────────────────
describe("Stage 3 — extractTimeline", () => {
  it("extracts immediate", () => {
    expect(extractTimeline("I need to move in ASAP")?.value).toBe("immediate");
  });

  it("extracts 1month", () => {
    expect(extractTimeline("We are looking to buy within a month")?.value).toBe("1month");
  });

  it("extracts browsing", () => {
    expect(extractTimeline("Just looking for now, no rush")?.value).toBe("browsing");
  });

  it("returns undefined when not mentioned", () => {
    expect(extractTimeline("I want a 3-bedroom villa")).toBeUndefined();
  });
});

// ── Stage 3d: Property Type + Bedrooms ────────────────────────────────────
describe("Stage 3 — extractPropertyType & extractBedrooms", () => {
  it("extracts apartment", () => {
    expect(extractPropertyType("Looking for a 2-bed apartment")?.value).toBe("apartment");
  });

  it("extracts villa", () => {
    expect(extractPropertyType("We want a villa with a pool")?.value).toBe("villa");
  });

  it("extracts bedroom count", () => {
    const r = extractBedrooms("I need a 3-bedroom apartment");
    expect(r?.value).toBe(3);
    expect(r?.confidence).toBeGreaterThanOrEqual(90);
  });
});

// ── Stage 4: Confidence Scoring ────────────────────────────────────────────
describe("Stage 4 — scoreResult", () => {
  it("returns hot for a fully-qualified lead", () => {
    const { leadTemperature, overallConfidence } = scoreResult(90, {
      budget:       { min: 400_000, max: 700_000, raw: "€400K–€700K", confidence: 90 },
      location:     { value: "sliema",    raw: "Sliema",      confidence: 95 },
      timeline:     { value: "1month",    raw: "within a month", confidence: 90 },
      propertyType: { value: "apartment", raw: "apartment",   confidence: 90 },
      bedrooms:     { value: 2,           raw: "2-bedroom",   confidence: 95 },
    });
    expect(leadTemperature).toBe("hot");
    expect(overallConfidence).toBeGreaterThanOrEqual(75);
  });

  it("returns cold/ice for sparse data", () => {
    const { leadTemperature } = scoreResult(30, {});
    expect(["cold", "ice"]).toContain(leadTemperature);
  });

  it("overallConfidence is bounded 0-100", () => {
    const { overallConfidence } = scoreResult(100, {
      budget:       { min: 1_000_000, raw: ">1M",       confidence: 100 },
      location:     { value: "valletta",   raw: "Valletta", confidence: 100 },
      timeline:     { value: "immediate",  raw: "now",      confidence: 100 },
      propertyType: { value: "penthouse",  raw: "penthouse",confidence: 100 },
      bedrooms:     { value: 3, raw: "3 bed", confidence: 100 },
    });
    expect(overallConfidence).toBeGreaterThanOrEqual(0);
    expect(overallConfidence).toBeLessThanOrEqual(100);
  });
});

// ── Full pipeline integration ──────────────────────────────────────────────
describe("runNLPPipeline — integration", () => {
  beforeAll(() => { vi.clearAllMocks(); });

  it("EN buy — all 4 stages", async () => {
    const r = await runNLPPipeline("I want to buy a 2-bedroom apartment in Sliema, budget €400K–€600K, ASAP");
    expect(r.language).toBe("en");
    expect(r.intent).toBe("buy");
    expect(r.entities.location?.value.toLowerCase()).toBe("sliema");
    expect(r.entities.bedrooms?.value).toBe(2);
    expect(r.entities.timeline?.value).toBe("immediate");
    expect(r.entityCount).toBeGreaterThanOrEqual(3);
    expect(r.overallConfidence).toBeGreaterThan(0);
  });

  it("RU buy", async () => {
    const r = await runNLPPipeline("Хочу купить квартиру на Мальте");
    expect(r.language).toBe("ru");
    expect(r.intent).toBe("buy");
  });

  it("ES rent in Gozo", async () => {
    const r = await runNLPPipeline("Quiero alquilar un apartamento en Gozo");
    expect(r.language).toBe("es");
    expect(r.intent).toBe("rent");
    expect(r.entities.location?.value.toLowerCase()).toBe("gozo");
  });
});
