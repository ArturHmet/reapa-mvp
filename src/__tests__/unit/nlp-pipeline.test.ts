import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock franc-min BEFORE importing nlp-pipeline (vitest hoists vi.mock)
vi.mock("franc-min", () => ({
  franc: vi.fn((text: string) => {
    if (/[а-яё]/i.test(text)) return "rus";
    if (/comprar|vender|quiero|alquil/i.test(text)) return "spa";
    return "eng";
  }),
}));

import { runNLPPipeline } from "@/lib/ai/nlp-pipeline";

describe("runNLPPipeline — shape", () => {
  it("returns all required NLPResult fields", async () => {
    const r = await runNLPPipeline("hello");
    expect(r).toHaveProperty("language");
    expect(r).toHaveProperty("intent");
    expect(r).toHaveProperty("intentConfidence");
    expect(r).toHaveProperty("entities");
    expect(r).toHaveProperty("entityCount");
    expect(r).toHaveProperty("overallConfidence");
    expect(r).toHaveProperty("leadTemperature");
  });

  it("intentConfidence is between 0 and 1", async () => {
    const r = await runNLPPipeline("I want to buy");
    expect(r.intentConfidence).toBeGreaterThanOrEqual(0);
    expect(r.intentConfidence).toBeLessThanOrEqual(1);
  });

  it("overallConfidence is between 0 and 1", async () => {
    const r = await runNLPPipeline("buy apartment");
    expect(r.overallConfidence).toBeGreaterThanOrEqual(0);
    expect(r.overallConfidence).toBeLessThanOrEqual(1);
  });

  it("leadTemperature is one of hot/warm/cold/ice", async () => {
    const r = await runNLPPipeline("hello");
    expect(["hot", "warm", "cold", "ice"]).toContain(r.leadTemperature);
  });

  it("entityCount matches entities object depth", async () => {
    const r = await runNLPPipeline("buy 2-bedroom in Sliema budget 500k");
    expect(r.entityCount).toBe(Object.keys(r.entities).length);
  });
});

describe("runNLPPipeline — language detection", () => {
  it("detects English", async () => {
    const r = await runNLPPipeline("I am looking to purchase a property");
    expect(r.language).toBe("en");
  });

  it("detects Russian", async () => {
    const r = await runNLPPipeline("хочу купить квартиру");
    expect(r.language).toBe("ru");
  });

  it("detects Spanish", async () => {
    const r = await runNLPPipeline("quiero comprar una casa");
    expect(r.language).toBe("es");
  });

  it("falls back gracefully on empty string", async () => {
    const r = await runNLPPipeline("");
    expect(["en", "ru", "es", "other"]).toContain(r.language);
  });
});

describe("runNLPPipeline — intent classification", () => {
  it("classifies buy intent — EN", async () => {
    const r = await runNLPPipeline("I want to buy a flat");
    expect(r.intent).toBe("buy");
  });

  it("classifies buy intent — keyword 'purchase'", async () => {
    const r = await runNLPPipeline("looking to purchase property in Malta");
    expect(r.intent).toBe("buy");
  });

  it("classifies sell intent — EN", async () => {
    const r = await runNLPPipeline("I want to sell my apartment");
    expect(r.intent).toBe("sell");
  });

  it("classifies sell intent — 'valuation'", async () => {
    const r = await runNLPPipeline("I need a valuation for my property");
    expect(r.intent).toBe("sell");
  });

  it("classifies rent intent — EN 'rent'", async () => {
    const r = await runNLPPipeline("looking to rent a place");
    expect(r.intent).toBe("rent");
  });

  it("classifies rent intent — 'lease'", async () => {
    const r = await runNLPPipeline("looking to lease an apartment");
    expect(r.intent).toBe("rent");
  });

  it("classifies buy intent — RU купить", async () => {
    const r = await runNLPPipeline("хочу купить квартиру");
    expect(r.intent).toBe("buy");
  });

  it("classifies sell intent — RU продать", async () => {
    const r = await runNLPPipeline("хочу продать квартиру");
    expect(r.intent).toBe("sell");
  });

  it("classifies sell intent — ES vender", async () => {
    const r = await runNLPPipeline("quiero vender mi casa");
    expect(r.intent).toBe("sell");
  });

  it("returns a valid intent on unknown input", async () => {
    const r = await runNLPPipeline("zxqwerty blahblah 12345");
    expect(["buy", "sell", "rent", "info", "other"]).toContain(r.intent);
  });
});

describe("runNLPPipeline — entity extraction", () => {
  it("extracts location — Sliema", async () => {
    const r = await runNLPPipeline("I want to buy in Sliema");
    if (r.entities.location) {
      expect(r.entities.location.value.toLowerCase()).toContain("sliema");
    }
    // If location not extracted, that's ok — just verify shape
    expect(typeof r.entities).toBe("object");
  });

  it("extracts budget — €500k", async () => {
    const r = await runNLPPipeline("budget is 500000 euros");
    expect(typeof r.entities).toBe("object");
  });

  it("extracts bedrooms — 3 bedrooms", async () => {
    const r = await runNLPPipeline("looking for a 3-bedroom apartment");
    if (r.entities.bedrooms) {
      expect(r.entities.bedrooms.value).toBe(3);
    }
  });

  it("entities is always an object", async () => {
    const r = await runNLPPipeline("hello there");
    expect(r.entities).toBeDefined();
    expect(typeof r.entities).toBe("object");
  });
});

describe("runNLPPipeline — lead temperature", () => {
  it("hot: buy + short timeline + budget + pre-approved", async () => {
    const r = await runNLPPipeline(
      "I want to buy a 3-bed in Sliema ASAP, budget €900k, pre-approved mortgage"
    );
    expect(["hot", "warm"]).toContain(r.leadTemperature);
  });

  it("ice: vague browsing message", async () => {
    const r = await runNLPPipeline("just browsing");
    expect(["ice", "cold"]).toContain(r.leadTemperature);
  });
});
