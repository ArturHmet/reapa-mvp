import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // 1. Fetch the lead
    const { data: lead, error: fetchError } = await admin
      .from("leads")
      .select("id, name, email, phone, budget_range, location, notes, temperature")
      .eq("id", id)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Already converted (ice = closed/converted)
    if ((lead as { temperature?: string }).temperature === "ice") {
      return NextResponse.json({ error: "Lead already converted" }, { status: 409 });
    }

    // 2. Parse budget_range → min/max (e.g. "300000-500000" or "500000")
    const budgetParts = ((lead as { budget_range?: string | null }).budget_range || "").match(/\d+/g);
    const budgetMin   = budgetParts ? parseInt(budgetParts[0]) : null;
    const budgetMax   = budgetParts && budgetParts.length > 1 ? parseInt(budgetParts[1]) : budgetMin;

    const leadData = lead as {
      name: string; email?: string | null; phone?: string | null;
      notes?: string | null; location?: string | null;
    };

    // 3. Create client record
    const { data: client, error: clientError } = await admin
      .from("clients")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({
        name:       leadData.name,
        email:      leadData.email      || null,
        phone:      leadData.phone      || null,
        budget_min: budgetMin,
        budget_max: budgetMax,
        status:     "active",
        notes:      leadData.notes
          ? `Converted from lead. Notes: ${leadData.notes}`
          : "Converted from lead.",
      } as any)
      .select()
      .single();

    if (clientError) throw clientError;

    // 4. Mark lead as converted (temperature → ice)
    await admin
      .from("leads")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ temperature: "ice" } as any)
      .eq("id", id);

    return NextResponse.json(
      { success: true, clientId: (client as { id: string }).id },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/leads/[id]/convert]", err);
    return NextResponse.json({ error: "Failed to convert lead" }, { status: 500 });
  }
}
