import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();

  // Supabase connectivity check
  let dbStatus: "ok" | "error" = "error";
  let dbLatencyMs = -1;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const t0 = Date.now();
    const { error } = await supabase.from("leads").select("id").limit(1);
    dbLatencyMs = Date.now() - t0;
    dbStatus = error ? "error" : "ok";
  } catch {
    // dbStatus stays "error"
  }

  const overall = dbStatus === "ok" ? "ok" : "degraded";

  return NextResponse.json(
    {
      status: overall,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
      timestamp: new Date().toISOString(),
      uptime_ms: Date.now() - started,
      checks: {
        database: { status: dbStatus, latency_ms: dbLatencyMs },
        ai: {
          gemini_key_set: !!(process.env.GEMINI_API_KEY),
        },
      },
    },
    { status: overall === "ok" ? 200 : 503 }
  );
}
