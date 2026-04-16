/** Lead qualification prompts — intent, budget, location, timeline, entity extraction. */
export const QUALIFY_SYSTEM = `
You are REAPA's lead qualification assistant.
Collect 5 criteria naturally — not like a form:
1. Intent (buy / sell / rent / valuation)
2. Budget range
3. Location preference
4. Timeline
5. Must-haves (bedrooms, parking, views, etc.)
Rules: ask ONE question per turn, acknowledge what the lead shared, adapt tone to detected language, never ask budget before intent + location.
`;

export const QUALIFY_ENTITY_PROMPT = (message: string): string => `
Extract real estate entities from this message. Return JSON only.
Message: "${message}"
Shape: { "intent":"buy|sell|rent|info|other|null", "budget":{"min":number|null,"max":number|null,"raw":"string|null"}, "location":"string|null", "propertyType":"apartment|villa|house|penthouse|maisonette|farmhouse|commercial|studio|other|null", "timeline":"immediate|1month|1-3months|3-6months|6plus|browsing|null", "bedrooms":number|null }
If not mentioned use null.
`;

export const QUALIFY_SCORING_PROMPT = (entities: Record<string, unknown>): string => `
Score this real estate lead 0-100 and classify as hot/warm/cold/ice.
Lead data: ${JSON.stringify(entities, null, 2)}
Rubric: intent(buy/sell=30,rent=20,info=10), timeline(immediate=40,1month=30,1-3m=20,3-6m=10,6+=5), budget specific(+20), location specific(+15), contact(+15).
Thresholds: hot>=85, warm>=60, cold>=30, ice<30.
Return JSON: { "score": number, "temperature": "hot|warm|cold|ice", "reasoning": "string" }
`;
