import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientId } from "@/lib/rate-limit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const clientId = getClientId(req);
  // BUG-041b: await rateLimit() — now async (Supabase-backed since BUG-016 fix)
  const rl = await rateLimit(clientId, { maxRequests: 3, windowMs: 3_600_000 });
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
  const email      = typeof b.email      === "string" ? b.email.toLowerCase().trim()  : "";
  const name       = typeof b.name       === "string" ? b.name.trim() || undefined     : undefined;
  const role       = typeof b.role       === "string" ? b.role                         : undefined;
  const language   = typeof b.language   === "string" ? b.language                     : "en";
  const source     = typeof b.source     === "string" ? b.source                       : undefined;
  // Sprint 11: referral tracking
  const referred_by = typeof b.referred_by === "string" ? b.referred_by.toUpperCase().trim() || undefined : undefined;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email, name, role, language, source, referred_by } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        { onConflict: "email" }
      );

    if (error) {
      console.error("[/api/waitlist] upsert error:", error);
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    // Send confirmation email via Resend (graceful no-op if RESEND_API_KEY not set)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
        const subjectLine = language === "ru"
          ? "Вы в списке ожидания REAPA ✅"
          : language === "es"
          ? "Estás en la lista de espera de REAPA ✅"
          : "You're on the REAPA waitlist ✅";

        const greeting =
          language === "ru" ? `Привет${name ? `, ${name}` : ""}!` :
          language === "es" ? `¡Hola${name ? `, ${name}` : ""}!` :
          `Hi${name ? ` ${name}` : ""}!`;

        const intro =
          language === "ru"
            ? "Спасибо за регистрацию в REAPA — AI-помощнике для агентов по недвижимости."
            : language === "es"
            ? "Gracias por registrarte en REAPA — el asistente de IA para agentes inmobiliarios."
            : "Thanks for joining the REAPA waitlist — the AI Copilot for real estate agents.";

        const body = `
          <div style="font-family:Inter,Arial,sans-serif;background:#0d0d28;color:#e5e7eb;padding:48px 24px;max-width:480px;margin:0 auto;border-radius:16px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:14px;">
                <span style="color:#fff;font-weight:700;font-size:24px;">R</span>
              </div>
            </div>
            <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">${subjectLine}</h1>
            <p style="color:#9ca3af;margin:0 0 16px;">${greeting}<br/>${intro}</p>
            <p style="color:#9ca3af;margin:0 0 24px;">We'll notify you as soon as early access opens. In the meantime, feel free to share your invite link.</p>
            <a href="https://reapa-mvp.vercel.app" style="display:inline-block;background:#4f46e5;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">Visit REAPA →</a>
            <p style="color:#4b5563;font-size:11px;margin-top:32px;">REAPA · Malta · reapa-mvp.vercel.app</p>
          </div>`;

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: subjectLine,
          html: body,
        });
      } catch (mailErr) {
        // Email failure must not break the signup response
        console.warn("[/api/waitlist] email send failed:", mailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/waitlist] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
