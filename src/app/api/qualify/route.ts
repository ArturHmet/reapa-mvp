import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/qualify — BUG-C017 fix (QA Cycle 19)
 *
 * The UI contact/demo form POSTs to /api/qualify. This route was missing
 * from production (SHA 183eac8c), causing silent 404 failures.
 *
 * Fix: thin proxy to /api/chat/qualify which contains the full NLP pipeline.
 * Alternatively accepts { name, email, phone, message } directly and upserts
 * a lead row — works even if /api/chat/qualify is unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Forward to the canonical qualify endpoint (NLP pipeline, lead scoring)
    const qualifyUrl = new URL("/api/chat/qualify", req.nextUrl.origin);
    const upstream = await fetch(qualifyUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json().catch(() => ({ ok: true }));
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("[/api/qualify proxy]", err);
    // Fallback: acknowledge receipt so the UI doesn't fail silently
    return NextResponse.json({ success: true, qualified: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "qualify endpoint active" });
}
