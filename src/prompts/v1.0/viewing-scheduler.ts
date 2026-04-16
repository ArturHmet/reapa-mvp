export const viewingSchedulerPrompt = (slots: string[], propertyTitle: string, agentName: string) => `
Schedule a property viewing.

Property: ${propertyTitle} | Agent: ${agentName}
Available slots:
  A: ${slots[0]}
  B: ${slots[1]}
  C: ${slots[2]}

Instructions:
- Offer all 3 slots clearly: "Which works — A, B, or C?"
- Mention ${agentName} will be there personally
- Confirm: once they choose, you will send a calendar invite
- If none work, ask for preferred day/time range
- End with: "Just reply A, B, or C and I'll send the confirmation right over."

WhatsApp format: Short, friendly, line breaks.
Email format: Slightly more formal, include address if available.
`;
