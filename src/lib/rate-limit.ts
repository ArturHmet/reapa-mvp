/**
 * REAPA Rate Limiter — edge-compatible in-memory limiter
 * Production upgrade path: replace with Upstash Redis (@upstash/ratelimit — free tier)
 */

interface RateLimitRecord { count: number; resetAt: number; }
const store = new Map<string, RateLimitRecord>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, r] of store.entries()) {
      if (r.resetAt < now) store.delete(k);
    }
  }, 60_000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

export function rateLimit(
  identifier: string,
  options: { windowMs?: number; maxRequests?: number } = {}
): RateLimitResult {
  const { windowMs = 60_000, maxRequests = 20 } = options;
  const now = Date.now();
  let record = store.get(identifier);
  if (!record || record.resetAt <= now) {
    record = { count: 0, resetAt: now + windowMs };
    store.set(identifier, record);
  }
  record.count += 1;
  const allowed = record.count <= maxRequests;
  return {
    allowed,
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
    retryAfterMs: allowed ? 0 : record.resetAt - now,
  };
}

export function getClientId(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  return `ip:${ip}`;
}
