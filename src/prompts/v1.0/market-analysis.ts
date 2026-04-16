export const marketAnalysisPrompt = (data: {
  area: string; propertyType: string; avgPricePerSqm?: number;
  avgDaysOnMarket?: number; inventory?: number; trend: "rising" | "stable" | "cooling";
  comparables?: string[]; quarter: string; language?: string;
}) => `Write a professional market analysis for a real estate client.

Data:
- Area: ${data.area} | Type: ${data.propertyType} | Period: ${data.quarter}
- Avg price/sqm: ${data.avgPricePerSqm ? `€${data.avgPricePerSqm}` : "not provided"}
- Days on market: ${data.avgDaysOnMarket ?? "not provided"} | Inventory: ${data.inventory ?? "not provided"}
- Trend: ${data.trend}
${data.comparables ? `- Comparables: ${data.comparables.join("; ")}` : ""}

Instructions: Expert advisor tone, not sales pitch. Lead with most important number.
Explain what trend means for this client. Be honest — don't oversell a cooling market.
End with one strategic recommendation.
Language: ${data.language ?? "en"} | Max: 180 words | ONLY use data provided above.`;
