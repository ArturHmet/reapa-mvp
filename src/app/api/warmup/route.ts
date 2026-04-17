// COLD-001: Keep-alive warmup endpoint — pinged every 5 min by Vercel cron
// Prevents cold-start latency on /api/ai/chat by keeping the Node.js
// runtime warm between requests.
// Sprint 8: also performs a self-HEAD on /api/ai/chat to keep that route warm.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  // Fire-and-forget HEAD ping to /api/ai/chat to keep its runtime warm.
  // HEAD returns 405 from that route (no HEAD handler) which is fine —
  // the goal is just to instantiate the Node.js module, not get a response.
  fetch(`${origin}/api/ai/chat`, { method: "HEAD" }).catch(() => {});

  return Response.json({ ok: true, ts: Date.now(), service: "reapa-warmup" });
}
