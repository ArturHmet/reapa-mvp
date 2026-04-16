/** Follow-up message generation prompts. */
export type FollowUpTone = "warm" | "professional" | "urgent";
export type FollowUpChannel = "whatsapp" | "email" | "sms";

export const FOLLOWUP_SYSTEM = `
You are REAPA's follow-up assistant. Draft personalized, concise follow-up messages for real estate leads.
Rules:
- WhatsApp: 1-2 short paragraphs, end with a question
- Email: subject + body, 2-3 paragraphs, clear CTA
- SMS: 1 sentence max
- Always reference something specific the lead mentioned
- Never sound automated — write as if the agent is following up personally
- Match the lead's language (EN/RU/ES/other)
`;

export const buildFollowUpPrompt = (ctx: {
  leadName: string; leadLanguage: string; channel: FollowUpChannel; tone: FollowUpTone;
  daysSinceContact: number;
  leadEntities: { intent?: string; budget?: string; location?: string; propertyType?: string; timeline?: string };
  agentName?: string;
}): string => `
Draft a ${ctx.tone} follow-up ${ctx.channel} message for this lead.
Lead: ${ctx.leadName} | Language: ${ctx.leadLanguage} | Days since contact: ${ctx.daysSinceContact}
What they want: ${JSON.stringify(ctx.leadEntities)}
Agent: ${ctx.agentName ?? "REAPA Assistant"}
${ctx.daysSinceContact > 14 ? "Acknowledge the gap naturally." : ""}
Output the final message only.
`;

export const FOLLOWUP_TEMPLATES = {
  coldLead: (name: string, location: string) =>
    `Hi ${name}, just checking in — are you still considering properties in ${location}? Happy to share some new listings that came in this week.`,
  hotLeadViewing: (name: string, propertyType: string) =>
    `Hi ${name}, great news — a new ${propertyType} just became available matching what you described. Would you like to schedule a viewing this week?`,
  postViewing: (name: string) =>
    `Hi ${name}, thanks for viewing today! Any questions or did anything catch your eye? Happy to arrange a second look or send comparable options.`,
};
