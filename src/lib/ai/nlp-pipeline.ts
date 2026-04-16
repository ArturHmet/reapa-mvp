/**
 * REAPA NLP Pipeline \u2014 Stages 1\u20134
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
    /\b(buy|purchase|buying|\u043a\u0443\u043f\u0438\u0442\u044c|\u043f\u043e\u043a\u0443\u043f\u043a\u0430|\u043f\u043e\u043a\u0443\u043f\u0430\u044e|comprar|comprando)\b/i,
    /\blooking (for|to buy)\b/i,
    /\binterested in (buying|purchasing)\b/i,
    /\b(\u0445\u043e\u0447\u0443|\u0445\u043e\u0442\u0438\u043c) \u043a\u0443\u043f\u0438\u0442\u044c\b/i,
    /\bquiero comprar\b/i,
  ],
  sell: [
    /\b(sell|selling|sold|\u043f\u0440\u043e\u0434\u0430\u0442\u044c|\u043f\u0440\u043e\u0434\u0430\u044e|vender|vendiendo)\b/i,
    /\b(want|looking) to sell\b/i,
    /\b(\u0445\u043e\u0447\u0443|\u0445\u043e\u0442\u0438\u043c) \u043f\u0440\u043e\u0434\u0430\u0442\u044c\b/i,
    /\bquiero vender\b/i,
    /\bvaluation\b/i,
    /\b\u043f\u0440\u043e\u0434\u0430\u0436\u0430\b/i,
  ],
  rent: [
    /\b(rent|rental|renting|lease|leasing|\u0430\u0440\u0435\u043d\u0434\u0430|\u0430\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c|\u0441\u043d\u044f\u0442\u044c|alquiler|alquilar)\b/i,
    /\blooking (for|to) rent\b/i,
    /\b(\u0445\u043e\u0447\u0443|\u0445\u043e\u0442\u0438\u043c) \u0441\u043d\u044f\u0442\u044c\b/i,
    /\bquiero alquilar\b/i,
    /\b(monthly|per month|\u0432 \u043c\u0435\u0441\u044f\u0446|por mes)\b/i,
  ],
  info: [
    /\b(info|information|question|questions|ask|\u0443\u0437\u043d\u0430\u0442\u044c|\u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f|\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c|pregunta|informaci\u00f3n|consulta)\b/i,
    /\bhow (much|many|does|do|is|are)\b/i,
    /\b(price|cost|fee|\u0441\u043a\u043e\u043b\u044c\u043a\u043e|\u0446\u0435\u043d\u0430|\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c|\u0441\u0442\u043e\u0438\u0442|precio|costo|cu\u00e1nto|cuesta)\b/i,
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
  if (s === "m" || s === "\u043c\u043b\u043d") return n * 1_000_000;
  if (s === "k" || s === "\u0442\u044b\u0441") return n * 1_000;
  return n;
}

export function extractBudget(text: string): BudgetEntity | undefined {
  const rangeMatch = text.match(/[\u20ac$\u00a3]?\s?(\d[\d,.]*)\s*[kKmM]?\s*[-\u2013to]+\s*[\u20ac$\u00a3]?\s?(\d[\d,.]*)\s*([kKmM]?)/i);
  if (rangeMatch) {
    const suffixA = rangeMatch[0].match(/(\d)(k|m)/i)?.[2] ?? "";
    const suffixB = rangeMatch[3] ?? suffixA;
    return { min: parseAmount(rangeMatch[1], suffixA), max: parseAmount(rangeMatch[2], suffixB), raw: rangeMatch[0], confidence: 90 };
  }
  const boundMatch = text.match(/(under|below|over|above|\u0434\u043e|\u043e\u0442)\s*[\u20ac$\u00a3]?\s?(\d[\d,.]*)\s*([kKmM]?)/i);
  if (boundMatch) {
    const isUnder = ["under", "below", "\u0434\u043e"].includes(boundMatch[1].toLowerCase());
    const amt = parseAmount(boundMatch[2], boundMatch[3] ?? "");
    return { min: isUnder ? undefined : amt, max: isUnder ? amt : undefined, raw: boundMatch[0], confidence: 80 };
  }
  const singleMatch = text.match(/[\u20ac$\u00a3]\s?(\d[\d,.]*)\s*([kKmM]?)/);
  if (singleMatch) { const amt = parseAmount(singleMatch[1], singleMatch[2] ?? ""); return { min: amt, max: amt, raw: singleMatch[0], confidence: 70 }; }
  return undefined;
}

const MALTA_LOCS = ["sliema","st julian","st. julian","san giljan","valletta","la valletta","msida","birkirkara","mellieha","gozo","goza","mosta","naxxar","bugibba","marsaskala","rabat","mdina","attard","balzan","lija","swieqi","paceville","pembroke","san gwann","zejtun","marsaxlokk","xaghra","victoria","sannat"];
const INTL_LOCS = ["malta","\u043c\u0430\u043b\u044c\u0442\u0430","london","madrid","dubai","lisbon"];
const ALL_LOCS = [...MALTA_LOCS, ...INTL_LOCS];

export function extractLocation(text: string): EntityValue<string> | undefined {
  const lower = text.toLowerCase();
  for (const loc of ALL_LOCS) {
    if (lower.includes(loc)) {
      const idx = lower.indexOf(loc);
      return { value: loc, raw: text.slice(idx, idx + loc.length), confidence: MALTA_LOCS.includes(loc) ? 95 : 75 };
    }
  }
  const fuzzy = text.match(/\b(?:in|near|around|\u0432|cerca de|en)\s+([A-Z\u0410-\u042fa-z\u0430-\u044f][a-zA-Z\u0430-\u044f\u0410-\u042f\s\-]{2,20})/);
  if (fuzzy) return { value: fuzzy[1].trim(), raw: fuzzy[0], confidence: 55 };
  return undefined;
}

const PROP_TYPES: Record<string, string> = {
  apartment:"apartment",flat:"apartment",studio:"studio",penthouse:"penthouse",villa:"villa",house:"house",
  townhouse:"townhouse",maisonette:"maisonette",farmhouse:"farmhouse",razzett:"farmhouse",
  office:"commercial",commercial:"commercial",
  "\u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0430":"apartment","\u0432\u0438\u043b\u043b\u0430":"villa","\u0434\u043e\u043c":"house","\u043f\u0435\u043d\u0442\u0445\u0430\u0443\u0441":"penthouse",
  apartamento:"apartment",piso:"apartment",chalet:"villa",casa:"house",
};

export function extractPropertyType(text: string): EntityValue<string> | undefined {
  const lower = text.toLowerCase();
  for (const [k, v] of Object.entries(PROP_TYPES)) { if (lower.includes(k)) return { value: v, raw: k, confidence: 90 }; }
  return undefined;
}

const TIMELINE_PATS: Array<{ pattern: RegExp; value: string; confidence: number }> = [
  { pattern: /\b(asap|immediately|urgent|\u0441\u0435\u0439\u0447\u0430\u0441|\u043d\u0435\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e|ahora)\b/i, value: "immediate", confidence: 95 },
  { pattern: /\b(this month|within (?:a |one |1 )?month|\u0432 \u044d\u0442\u043e\u043c \u043c\u0435\u0441\u044f\u0446\u0435|este mes)\b/i, value: "1month", confidence: 90 },
  { pattern: /\b(1[-\u2013]3 months?|next (few|couple) months?|1-3 \u043c\u0435\u0441\u044f\u0446|1-3 meses)\b/i, value: "1-3months", confidence: 88 },
  { pattern: /\b(3[-\u2013]6 months?|half[- ]year|3-6 \u043c\u0435\u0441\u044f\u0446|3-6 meses)\b/i, value: "3-6months", confidence: 85 },
  { pattern: /\b(next year|(?:6|six) months?|over a year|\u0432 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u043c \u0433\u043e\u0434\u0443|el a\u00f1o que viene)\b/i, value: "6plus", confidence: 80 },
  { pattern: /\b(just (looking|browsing)|no rush|\u043f\u0440\u043e\u0441\u0442\u043e \u0441\u043c\u043e\u0442\u0440\u044e)\b/i, value: "browsing", confidence: 70 },
];

export function extractTimeline(text: string): EntityValue<string> | undefined {
  for (const { pattern, value, confidence } of TIMELINE_PATS) {
    const m = text.match(pattern);
    if (m) return { value, raw: m[0], confidence };
  }
  return undefined;
}

export function extractBedrooms(text: string): EntityValue<number> | undefined {
  const m = text.match(/(\d+)\s*(?:bed(?:room)?s?|br|\u043a\u043e\u043c\u043d\u0430\u0442|\u0441\u043f\u0430\u043b\u044c\u043d|dormitorio)/i);
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
