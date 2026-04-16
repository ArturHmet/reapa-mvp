import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

type SupabaseClient = {
  id: string; name: string; email: string | null; phone: string | null;
  nationality: string | null; budget_min: number | null; budget_max: number | null;
  preferred_areas: string[] | null; property_type: string[] | null;
  status: string | null; notes: string | null; aml_verified: boolean | null;
  created_at: string; updated_at: string;
};

function mapStatus(s: string | null): string {
  if (s === "closed") return "closed";
  if (s === "paused") return "qualified";
  return "viewing";
}
function daysSince(d: string): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("clients")
      .select("id, name, email, phone, nationality, budget_min, budget_max, preferred_areas, property_type, status, notes, aml_verified, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const clients = (data as SupabaseClient[]).map((c) => ({
      id: c.id, name: c.name, email: c.email || "", phone: c.phone || "",
      nationality: c.nationality || "International", stage: mapStatus(c.status),
      budget: c.budget_max || c.budget_min || 0,
      preferredArea: (c.preferred_areas && c.preferred_areas[0]) || "Malta",
      propertyType: (c.property_type && c.property_type[0]) || "Apartment",
      bedrooms: 2, viewingsCount: 0, lastContact: c.updated_at,
      daysInactive: daysSince(c.updated_at),
      sentiment: c.aml_verified ? "positive" : "neutral",
      agent: "You", notes: c.notes || "", createdAt: c.created_at,
    }));
    return NextResponse.json(clients);
  } catch (err) {
    console.error("[/api/clients]", err);
    return NextResponse.json([], { status: 500 });
  }
}
