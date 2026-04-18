import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientId } from "@/lib/rate-limit";

/** Generate a 6-character alphanumeric referral code. */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/referral/generate
 * Body: { email: string }
 * Returns: { referral_code: string, invite_url: string }
 *
 * Idempotent — if the email already has a referral_code, returns the existing one.
 */
export async function POST(req: NextRequest) {
  const clientId = getClientId(req);
  const rl = await rateLimit(clientId, { maxRequests: 10, windowMs: 3_600_000 });
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
  const email = typeof (body as Record<string, unknown>).email === "string"
    ? ((body as Record<string, unknown>).email as string).toLowerCase().trim()
    : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // Check if this email already has a code
    // Cast required: Supabase TS types don't yet include Sprint 11 referral columns
    const existing = ((await supabase
      .from("waitlist")
      .select("referral_code")
      .eq("email", email)
      .maybeSingle()).data) as { referral_code: string | null } | null;

    if (existing?.referral_code) {
      const inviteUrl = buildInviteUrl(existing.referral_code);
      return NextResponse.json({ referral_code: existing.referral_code, invite_url: inviteUrl });
    }

    // Generate a unique code (retry up to 3 times on collision)
    let code = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = generateCode();
      const collision = ((await supabase
        .from("waitlist")
        .select("id")
        .eq("referral_code", candidate)
        .maybeSingle()).data) as { id: string } | null;
      if (!collision) { code = candidate; break; }
    }
    if (!code) {
      return NextResponse.json({ error: "Could not generate unique code" }, { status: 500 });
    }

    // Upsert the code onto the row (create row if needed)
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, referral_code: code }, { onConflict: "email" });

    if (error) throw error;

    const inviteUrl = buildInviteUrl(code);
    return NextResponse.json({ referral_code: code, invite_url: inviteUrl });
  } catch (err) {
    console.error("[/api/referral/generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildInviteUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://reapa-mvp.vercel.app";
  return `${base}/join?ref=${code}`;
}
