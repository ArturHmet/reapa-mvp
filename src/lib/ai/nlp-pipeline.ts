/**
 * REAPA NLP Pipeline — Stages 1–4
 * Stage 1: Language Detection (franc-min)
 * Stage 2: Intent Classification (regex + keyword)
 * Stage 3: Entity Extraction (budget, location, property type, timeline, bedrooms)
 * Stage 4: Confidence Scoring (per-entity 0-100 + lead temperature)
 */

export type DetectedLanguage = "en" | "ru" | "es" | "other";
export type Intent = "buy" | "sell" | "rent" | "info" | "other";
export type LeadTemperature = "hot" | "warm" | "cold" | "ice";

export interface EntityValue<T = string> {
  value: T;
  raw: string;
  confidence: number;
}

export interface BudgetEntity {
  min?: number;
  max?: number;
  raw: string;
  confidence: number;
}

export interface ExtractedEntities {
  budget?: BudgetEntity;
  location?: EntityValue<string>;
  propertyType?: EntityValue<string>;
  timeline?: EntityValue<string>;
  bedrooms?: EntityValue<number>;
}

export interface NLPResult {
  language: DetectedLanguage;
  intent: Intent;
  intentConfidence: number;
  entities: ExtractedEntities;
  entityCount: number;
  overallConfidence: number;
  leadTemperature: LeadTemperature;
}

const LANG_MAP: Record<string, DetectedLanguage> = { eng: "en", rus: "ru", spa: "es" };

export async function detectLanguage(text: string): Promise<DetectedLanguage> {
  try {
    const { franc } = await import("franc-min");
    const code = franc(text, { minLength: 5 });
    return LANG_MAP[code] ?? "other";
  } catch {
    return "en";
  }
}

const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  buy: [
    /\b(buy|purchase|buying|купить|покупка|покупаю|comprar|comprando)\b/i,
    /\blooking (for|to buy)\b/i,
    /\binterested in (buying|purchasing)\b/i,
    /\b(хочу|хотим) купить\b/i,
    /\bquiero comprar\b/i,
  ],
  sell: [
    /\b(sell|selling|sold|продать|продаю|vender|vendiendo)\b/i,
    /\b(want|looking) to sell\b/i,
    /\b(хочу|хотим) продать\b/i,
    /\bquiero vender\b/i,
    /\bvaluation\b/i,
    /\bпродажа\b/i,
  ],
  rent: [
    /\b(rent|rental|renting|lease|leasing|аренда|арендовать|снять|alquiler|alquilar)\b/i,
    /\blooking (for|to) rent\b/i,
    /\b(хочу|хотим) снять\b/i,
    /\bquiero alquilar\b/i,
    /\b(monthly|per month|в месяц|por mes)\b/i,
  ],
  info: [
    /\b(info|information|question|questions|ask|узнать|информация|pregunta)\b/i,
    /\bhow (much|many|does|do|is|are)\b/i,
    /\b(price|cost|fee|сколько|precio|costo)\b/i,
    /\bwhat (is|are)\b/i,
    /\bavailable\b/i,
  ],
  other: [],
};

export function classifyIntent(text: string): { intent: Intent; confidence: number } {
  const scores: Partial<Record<Intent, number>> = {};
  for (const intent of (["buy", "sell", "rent", "info"] as Intent[])) {
    let score = 0;
    for (const p of INTENT_PATTERNS[intent]) { if (p.test(text)) score += 25; }
    if (score > 0) scores[intent] = Math.min(score, 100);
  }
  if (!Object.keys(scores).length) return { intent: "other", confidence: 30 };
  const best = Object.entries(scores).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  return { intent: best[0] as Intent, confidence: best[1] as number };
}

function parseAmount(num: string, suffix: string): number {
  const n = parseFloat(num.replace(/,/g, ""));
  const s = suffix.toLowerCase();
  if (s === "m" || s === "млн") return n * 1_000_000;
  if (s === "k" || s === "тыс") return n * 1_000;
  return n;
}

export function extractBudget(text: string): BudgetEntity | undefined {
  const rangeMatch = text.match(/[€$£]?\s?(\d[\d,.]*)\s*[kKmM]?\s*[-–to]+\s*[€$£]?\s?(\d[\d,.]*)\s*([kKmM]?)/i);
  if (rangeMatch) {
    const suffixA = rangeMatch[0].match(/(\d)(k|m)/i)?.[2] ?? "";
    const suffixB = rangeMatch[3] ?? suffixA;
    return { min: parseAmount(rangeMatch[1], suffixA), max: parseAmount(rangeMatch[2], suffixB), raw: rangeMatch[0], confidence: 90 };
  }
  const boundMatch = text.match(/(under|below|over|above|до|от)\s*[€$£]?\s?(\d[\d,.]*)\s*([kKmM]?)/i);
  if (boundMatch) {
    const isUnder = ["under", "below", "до"].includes(boundMatch[1].toLowerCase());
    const amt = parseAmount(boundMatch[2], boundMatch[3] ?? "");
    return { min: isUnder ? undefined : amt, max: isUnder ? amt : undefined, raw: boundMatch[0], confidence: 80 };
  }
  const singleMatch = text.match(/[€$£]\s?(\d[\d,.]*)\s*([kKmM]?)/);
  if (singleMatch) { const amt = parseAmount(singleMatch[1], singleMatch[2] ?? ""); return { min: amt, max: amt, raw: singleMatch[0], confidence: 70 }; }
  return undefined;
}

const MALTA_LOCS = ["sliema","st julian","st. julian","san giljan","valletta","la valletta","msida","birkirkara","mellieha","gozo","goza","mosta","naxxar","bugibba","marsaskala","rabat","mdina","attard","balzan","lija","swieqi","paceville","pembroke","san gwann","zejtun","marsaxlokk","xaghra","victoria","sannat"];
const INTL_LOCS = ["malta","мальта","london","madrid","dubai","lisbon"];
const ALL_LOCS = [...MALTA_LOCS, ...INTL_LOCS];

export function extractLocation(text: string): EntityValue<string> | undefined {
  const lower = text.toLowerCase();
  for (const loc of ALL_LOCS) {
    if (lower.includes(loc)) {
      const idx = lower.indexOf(loc);
      return { value: loc, raw: text.slice(idx, idx + loc.length), confidence: MALTA_LOCS.includes(loc) ? 95 : 75 };
    }
  }
  const fuzzy = text.match(/\b(?:in|near|around|в|cerca de|en)\s+([A-ZА-Яa-zа-я][a-zA-Zа-яА-Я\s\-]{2,20})/);
  if (fuzzy) return { value: fuzzy[1].trim(), raw: fuzzy[0], confidence: 55 };
  return undefined;
}

const PROP_TYPES: Record<string, string> = {
  apartment:"apartment",flat:"apartment",studio:"studio",penthouse:"penthouse",villa:"villa",house:"house",
  townhouse:"townhouse",maisonette:"maisonette",farmhouse:"farmhouse",razzett:"farmhouse",
  office:"commercial",commercial:"commercial",
  квартира:"apartment",вилла:"villa",дом:"house",пентхаус:"penthouse",
  apartamento:"apartment",piso:"apartment",chalet:"villa",casa:"house",
};

export function extractPropertyType(text: string): EntityValue<string> | undefined {
  const lower = text.toLowerCase();
  for (const [k, v] of Object.entries(PROP_TYPES)) { if (lower.includes(k)) return { value: v, raw: k, confidence: 90 }; }
  return undefined;
}

const TIMELINE_PATS: Array<{ pattern: RegExp; value: string; confidence: number }> = [
  { pattern: /\b(asap|immediately|urgent|сейчас|немедленно|ahora)\b/i, value: "immediate", confidence: 95 },
  { pattern: /\b(this month|within (?:a |one |1 )?month|в этом месяце|este mes)\b/i, value: "1month", confidence: 90 },
  { pattern: /\b(1[-–]3 months?|next (few|couple) months?|1-3 месяц|1-3 meses)\b/i, value: "1-3months", confidence: 88 },
  { pattern: /\b(3[-–]6 months?|half[- ]year|3-6 месяц|3-6 meses)\b/i, value: "3-6months", confidence: 85 },
  { pattern: /\b(next year|(?:6|six) months?|over a year|в следующем году|el año que viene)\b/i, value: "6plus", confidence: 80 },
  { pattern: /\b(just (looking|browsing)|no rush|просто смотрю)\b/i, value: "browsing", confidence: 70 },
];

export function extractTimeline(text: string): EntityValue<string> | undefined {
  for (const { pattern, value, confidence } of TIMELINE_PATS) {
    const m = text.match(pattern);
    if (m) return { value, raw: m[0], confidence };
  }
  return undefined;
}

export function extractBedrooms(text: string): EntityValue<number> | undefined {
  const m = text.match(/(\d+)\s*(?:bed(?:room)?s?|br|комнат|спальн|dormitorio)/i);
  if (m) return { value: parseInt(m[1], 10), raw: m[0], confidence: 95 };
  return undefined;
}

export function extractEntities(text: string): ExtractedEntities {
  return {
    budget: extractBudget(text),
    location: extractLocation(text),
    propertyType: extractPropertyType(text),
    timeline: extractTimeline(text),
    bedrooms: extractBedrooms(text),
  };
}

export function scoreResult(intentConfidence: number, entities: ExtractedEntities): { overallConfidence: number; leadTemperature: LeadTemperature } {
  const w = { intent: 0.25, budget: 0.2, location: 0.2, timeline: 0.2, propertyType: 0.1, bedrooms: 0.05 };
  const s = {
    intent: intentConfidence,
    budget: entities.budget?.confidence ?? 0,
    location: entities.location?.confidence ?? 0,
    timeline: entities.timeline?.confidence ?? 0,
    propertyType: entities.propertyType?.confidence ?? 0,
    bedrooms: entities.bedrooms?.confidence ?? 0,
  };
  const overall = Math.round(Object.entries(w).reduce((acc, [k, wt]) => acc + s[k as keyof typeof s] * wt, 0));
  const leadTemperature: LeadTemperature = overall >= 75 ? "hot" : overall >= 50 ? "warm" : overall >= 25 ? "cold" : "ice";
  return { overallConfidence: overall, leadTemperature };
}

export async function runNLPPipeline(message: string): Promise<NLPResult> {
  const [language, { intent, confidence: intentConfidence }, entities] = await Promise.all([
    detectLanguage(message),
    Promise.resolve(classifyIntent(message)),
    Promise.resolve(extractEntities(message)),
  ]);
  const { overallConfidence, leadTemperature } = scoreResult(intentConfidence, entities);
  return { language, intent, intentConfidence, entities, entityCount: Object.values(entities).filter(Boolean).length, overallConfidence, leadTemperature };
}
