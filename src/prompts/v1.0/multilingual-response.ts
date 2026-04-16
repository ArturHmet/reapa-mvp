export const multilingualResponsePrompt = (
  clientMessage: string, detectedLanguage: string, agentContext: string
) => `Respond to this real estate client message in ${detectedLanguage}.

Client message: "${clientMessage}"
Agent context: ${agentContext}

Tone rules by language:
EN: Professional + warm. RU: Formal "вы", trust-building. ES: Warm, relationship-first.
FR: Formal "vous", precise. ZH: Data-driven, ROI-focused. AR: Formal, prestige-aware.
PT: Warm, financing-aware. HI: Respectful "आप". DE: Precise, factual. TR: Warm, investment focus. IT: Warm, lifestyle-first.

Keep under 120 words. End with one clear CTA.`;
