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

Structure:
1) Hook headline
2) Opening (lifestyle hook + strongest feature)
3) Property details — ALL details from brief MUST appear (bedrooms, bathrooms, area, every feature listed)
4) Location context — Malta neighbourhood highlights (walkability, transport, amenities, sea proximity if relevant)
5) CTA (no price in body)
6) Mandatory disclosures block (see below — REQUIRED in all languages)

MANDATORY DISCLOSURES — append at end, in the OUTPUT LANGUAGE. NEVER omit regardless of language:
- EPC:
  EN → "An Energy Performance Certificate (EPC) is required by Maltese law for all sales and lettings."
  RU → "Для всех сделок купли-продажи и аренды на Мальте обязателен сертификат энергоэффективности (EPC)."
  ES → "El Certificado de Eficiencia Energética (EPC) es obligatorio según la ley maltesa para ventas y alquileres."
  (For other languages, translate the EPC notice appropriately.)
- Agency fees:
  EN → "Agency fees apply (3.5–5% + VAT)."
  RU → "Комиссия агентства: 3,5–5% + НДС."
  ES → "Se aplican honorarios de agencia (3,5–5% + IVA)."
  (For other languages, translate appropriately.)

COMPLETENESS RULE: Every property detail in the brief must appear in the description body.
Do NOT omit bedrooms, bathrooms, area sqm, or any feature listed above due to language or word count.
Language: ${property.language ?? "en"} | Word count: 180–240 words (includes mandatory disclosures)`;
