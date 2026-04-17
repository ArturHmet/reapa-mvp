// COLD-001: Keep-alive warmup endpoint — pinged every 5 min by Vercel cron
// Prevents cold-start latency >5s on /api/ai/chat by keeping the Node.js
// runtime warm between requests.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, ts: Date.now(), service: "reapa-warmup" });
}
