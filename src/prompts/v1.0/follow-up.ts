export const followUpPrompt = (params: {
  clientName: string; propertyTitle: string; touchNumber: 1 | 2 | 3;
  followUpType: "post_viewing" | "no_reply" | "price_drop" | "warm_nurture";
  update?: string; agentName: string; language?: string;
}) => `Write a follow-up message for a real estate lead.

Client: ${params.clientName} | Property: ${params.propertyTitle}
Touch #${params.touchNumber} of 3 | Type: ${params.followUpType}
${params.update ? `Update: ${params.update}` : ""}
Agent: ${params.agentName}

Touch tone: ${{ 1: "Soft check-in, add value, no pressure", 2: "Gentle nudge, mention scarcity or update", 3: "Respectful closure, leave door open" }[params.touchNumber]}
Type angle: ${{ post_viewing: "Ask for feedback, offer to answer questions", no_reply: "Reference original inquiry, offer new perspective", price_drop: "Lead with reduction as hook, be specific", warm_nurture: "Share relevant listing or insight, no hard sell" }[params.followUpType]}

Rules: Max 80 words | No desperate tone | Sign as: REAPA, for ${params.agentName}
Language: ${params.language ?? "en"} | Do NOT use the word "just"`;
