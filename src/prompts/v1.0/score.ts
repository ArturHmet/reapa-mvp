/** Lead scoring rubric — weights, thresholds, calculateScore(), LLM prompt. */

export const SCORING_RUBRIC = {
  intent:   { buy: 30, sell: 30, valuation: 25, rent: 20, info: 10, browse: 5, other: 0 },
  timeline: { immediate: 40, "1month": 35, "1-3months": 25, "3-6months": 15, "6plus": 8, browsing: 3 },
  budget:   { specific_range: 20, single_value: 12, vague: 6, none: 0 },
  location: { specific_area: 15, city_only: 8, none: 0 },
  contact:  { phone_and_email: 15, phone_only: 10, email_only: 8, none: 0 },
} as const;

export const TEMPERATURE_THRESHOLDS = { hot: 85, warm: 60, cold: 30, ice: 0 } as const;
export type LeadTemperature = "hot" | "warm" | "cold" | "ice";

export function calculateScore(signals: {
  intent?: string; timeline?: string;
  budgetSpecificity?: "specific_range"|"single_value"|"vague"|"none";
  locationSpecificity?: "specific_area"|"city_only"|"none";
  contactStatus?: "phone_and_email"|"phone_only"|"email_only"|"none";
}): { score: number; temperature: LeadTemperature } {
  let score = 0;
  score += SCORING_RUBRIC.intent[signals.intent as keyof typeof SCORING_RUBRIC.intent] ?? 0;
  score += SCORING_RUBRIC.timeline[signals.timeline as keyof typeof SCORING_RUBRIC.timeline] ?? 0;
  score += SCORING_RUBRIC.budget[signals.budgetSpecificity ?? "none"];
  score += SCORING_RUBRIC.location[signals.locationSpecificity ?? "none"];
  score += SCORING_RUBRIC.contact[signals.contactStatus ?? "none"];
  const capped = Math.min(100, Math.max(0, score));
  const temperature: LeadTemperature = capped >= 85 ? "hot" : capped >= 60 ? "warm" : capped >= 30 ? "cold" : "ice";
  return { score: capped, temperature };
}

export const SCORE_SYSTEM_PROMPT = `
You are a real estate lead scoring expert for REAPA.
Rubric (max 100 pts): intent(buy/sell=30,valuation=25,rent=20,info=10,browse=5), timeline(immediate=40,1m=35,1-3m=25,3-6m=15,6+=8), budget(range=20,single=12,vague=6), location(specific=15,city=8), contact(both=15,phone=10,email=8).
Temperature: hot>=85 (<15min followup), warm>=60 (same day), cold>=30 (nurture), ice<30 (park).
Output JSON only: { "score": number, "temperature": "hot|warm|cold|ice", "summary": "string" }
`;
