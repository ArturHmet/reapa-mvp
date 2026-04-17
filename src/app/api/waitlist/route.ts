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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from("waitlist")
      .upsert(
        { email, name, role, language, source },
        { onConflict: "email", ignoreDuplicates: true }
      );
    if (error) throw error;

    // ── Waitlist confirmation email (Resend) ─────────────────────────────────
    // Graceful no-op when RESEND_API_KEY is not set — signup is already saved.
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "REAPA <onboarding@resend.dev>",
          to: email,
          subject: "You are on the REAPA beta waitlist! 🏠",
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d28;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d28;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13132a;border-radius:16px;overflow:hidden;border:1px solid #2d2d6b;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🏠 REAPA</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI Copilot for Real Estate Agents</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;">You&apos;re on the list! 🎉</h2>
            <p style="margin:0 0 20px;color:#a0a0c8;font-size:15px;line-height:1.6;">
              ${name ? `Hi <strong style="color:#e0e0ff;">${name}</strong>,<br><br>` : ""}
              Thank you for joining the <strong style="color:#818cf8;">REAPA beta waitlist</strong>.
              We&apos;re building the first AI assistant purpose-built for real estate agents in Malta and beyond.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a40;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr><td>
                <p style="margin:0 0 8px;color:#818cf8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">What&apos;s coming for you</p>
                <ul style="margin:0;padding-left:20px;color:#a0a0c8;font-size:14px;line-height:1.8;">
                  <li>🤖 AI lead qualification in <strong style="color:#c4b5fd;">10 languages</strong></li>
                  <li>📋 AML/KYC compliance automation</li>
                  <li>📊 Smart CRM with sentiment tracking</li>
                  <li>⚡ 24/7 auto-responses while you sleep</li>
                </ul>
              </td></tr>
            </table>
            <p style="margin:0 0 28px;color:#a0a0c8;font-size:14px;line-height:1.6;">
              We&apos;ll notify you when your early access slot opens. Beta is free and limited to Malta agents first.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:8px;background:linear-gradient(135deg,#4f46e5,#7c3aed);">
                <a href="https://reapa-mvp.vercel.app" target="_blank"
                   style="display:inline-block;padding:14px 28px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">
                  Explore REAPA →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2d2d6b;">
            <p style="margin:0;color:#555580;font-size:12px;text-align:center;">
              REAPA · AI Real Estate Assistant · Malta 🇲🇹<br>
              <a href="https://reapa-mvp.vercel.app/privacy" style="color:#6366f1;text-decoration:none;">Privacy Policy</a>
              &nbsp;·&nbsp;
              <a href="https://reapa-mvp.vercel.app/terms" style="color:#6366f1;text-decoration:none;">Terms of Service</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
      } catch (emailErr) {
        // Non-fatal — log and continue. Signup is already saved.
        console.warn("[/api/waitlist] Confirmation email failed (non-fatal):", emailErr);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch (err) {
    console.error("[/api/waitlist]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
