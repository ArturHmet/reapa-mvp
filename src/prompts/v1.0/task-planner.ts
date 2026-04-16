export const taskPlannerPrompt = (ctx: {
  hotLeads: number; pendingViewings: number; followUpsDue: number; newInquiries: number; date: string;
}) => `Help a real estate agent plan their workday.

Today (${ctx.date}):
- Hot leads: ${ctx.hotLeads} | Viewings: ${ctx.pendingViewings} | Follow-ups due: ${ctx.followUpsDue} | New inquiries: ${ctx.newInquiries}

Create prioritized daily plan:
1. Time-sensitive first (viewings, urgent follow-ups)
2. Batch similar tasks (all follow-ups together)
3. Reserve 30min for unexpected urgent items
4. Flag anything waiting >48 hours

Format:
- Morning (9am–12pm): [3 tasks]
- Midday (12pm–3pm): [3 tasks]
- Afternoon (3pm–6pm): [3 tasks]
- Urgent (must happen today): [list]

Tone: Sharp EA briefing you before a busy day. Max 200 words. Be specific.`;
