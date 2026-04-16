import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type SupabaseLead = {
  id: string; name: string; email: string | null; phone: string | null;
  source: string | null; score: number | null; temperature: string | null;
  intent: string | null; budget_range: string | null; location: string | null;
  notes: string | null; last_contact_at: string | null; created_at: string;
};

function parseBudget(range: string | null): number {
  if (!range) return 0;
  const match = range.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
function mapSource(src: string | null): string {
  if (!src) return "portal";
  const map: Record<string, string> = { chat: "whatsapp", manual: "referral", email: "email", portal: "portal", instagram: "instagram", facebook: "facebook", whatsapp: "whatsapp", referral: "referral" };
  return map[src] || "portal";
}
function mapTemperature(temp: string | null): "hot" | "warm" | "cold" {
  if (temp === "hot") return "hot";
  if (temp === "warm") return "warm";
  return "cold";
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("leads")
      .select("id, name, email, phone, source, score, temperature, intent, budget_range, location, notes, last_contact_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const leads = (data as SupabaseLead[]).map((l) => ({
      id: l.id, name: l.name, phone: l.phone || "", email: l.email || "",
      source: mapSource(l.source), score: mapTemperature(l.temperature),
      budget: parseBudget(l.budget_range), location: l.location || "",
      propertyType: l.intent === "buy" ? "Apartment" : l.intent === "rent" ? "Rental" : l.intent === "sell" ? "For Sale" : "Property",
      bedrooms: 2, nationality: "International", message: l.notes || "",
      createdAt: l.created_at, lastContact: l.last_contact_at || l.created_at,
      autoReplied: l.source === "chat", notes: l.notes || "",
    }));
    return NextResponse.json(leads);
  } catch (err) {
    console.error("[/api/leads]", err);
    return NextResponse.json([], { status: 500 });
  }
}
