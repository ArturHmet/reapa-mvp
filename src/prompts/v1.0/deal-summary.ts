export const dealSummaryPrompt = (deal: {
  clientName: string; propertyTitle: string; propertyAddress: string;
  agreedPrice: number; currency: string;
  status: "verbal_agreement" | "konvenju_signed" | "final_deed";
  keyDates: { label: string; date: string }[];
  notes?: string; language?: string;
}) => `Generate a professional deal summary document.

Deal:
- Client: ${deal.clientName} | Property: ${deal.propertyTitle}
- Address: ${deal.propertyAddress}
- Agreed Price: ${deal.currency} ${deal.agreedPrice.toLocaleString()}
- Status: ${deal.status}
- Key Dates: ${deal.keyDates.map(d => `${d.label}: ${d.date}`).join(" | ")}
${deal.notes ? `- Notes: ${deal.notes}` : ""}

Structure: 1) Status summary 2) Property & client details 3) Financials (price + stamp duty est. + notary fees est.)
4) Timeline + what happens next 5) Outstanding action items

Language: ${deal.language ?? "en"}
Format: Clean sections with headers, suitable for email.
Note: Stamp duty estimate = 5% of price (buyer, standard). Notary = ~1–2%. Add: "Consult your notary for exact figures."`;
