import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientId } from "@/lib/rate-limit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);
  const rl = rateLimit(clientId, { maxRequests: 3, windowMs: 3_600_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.toLowerCase().trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() || undefined : undefined;
  const role = typeof b.role === "string" ? b.role : undefined;
  const language = typeof b.language === "string" ? b.language : "en";
  const source = typeof b.source === "string" ? b.source : undefined;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("waitlist")
      .upsert(
        { email, name, role, language, source },
        { onConflict: "email", ignoreDuplicates: true }
      );
    if (error) throw error;
    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch (err) {
    console.error("[/api/waitlist]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
