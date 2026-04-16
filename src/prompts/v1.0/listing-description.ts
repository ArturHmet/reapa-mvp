export const listingDescriptionPrompt = (property: {
  type: string; bedrooms: number; bathrooms: number; areaSqm: number;
  location: string; features: string[]; condition: string;
  price?: number; targetBuyer: "investors" | "families" | "expats" | "luxury"; language?: string;
}) => `Generate a professional real estate listing description.

Property: ${property.type}, ${property.bedrooms}bed/${property.bathrooms}bath, ${property.areaSqm}sqm
Location: ${property.location} | Condition: ${property.condition}
Features: ${property.features.join(", ")}
Target buyer: ${property.targetBuyer}

Tone: ${{ investors: "ROI-first, rental yield, capital growth", families: "space, safety, schools, lifestyle", expats: "lifestyle upgrade, sun/sea, relocation ease", luxury: "exclusivity, prestige, understated elegance" }[property.targetBuyer]}

Structure: 1) Hook headline 2) Opening (lifestyle + strongest feature) 3) Property details 4) Location 5) CTA (no price in body)
Language: ${property.language ?? "en"} | Word count: 160–220 words`;
