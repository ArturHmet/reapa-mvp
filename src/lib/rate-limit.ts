/**
 * REAPA Rate Limiter — BUG-016 fix: Supabase-backed sliding window
 *
 * Uses atomic PostgreSQL RPC (increment_rate_limit) to enforce rate limits
 * across all Vercel lambda instances. Falls back to in-memory on DB error.
 */
import { createClient } from "@supabase/supabase-js";

// ── In-memory fallback (single-instance dev / DB unavailable) ──────────────
interface RateLimitRecord { count: number; resetAt: number; }
const fallbackStore = new Map<string, RateLimitRecord>();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, r] of fallbackStore.entries()) {
      if (r.resetAt < now) fallbackStore.delete(k);
    }
  }, 60_000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

// ── Shared Supabase rate limiter ────────────────────────────────────────────
export async function rateLimit(
  identifier: string,
  options: { windowMs?: number; maxRequests?: number } = {}
): Promise<RateLimitResult> {
  const { windowMs = 60_000, maxRequests = 20 } = options;
  const now = Date.now();
  // Align to fixed window boundary (not sliding — simpler and atomic)
  const windowStart = now - (now % windowMs);
  const resetAt = windowStart + windowMs;

  // ── Try Supabase RPC (shared across instances) ──────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.rpc("increment_rate_limit", {
        p_client_id: identifier,
        p_window_start: windowStart,
        p_window_ms: windowMs,
      });
      if (!error && typeof data === "number") {
        const count = data;
        const allowed = count <= maxRequests;
        return {
          allowed,
          remaining: Math.max(0, maxRequests - count),
          resetAt,
          retryAfterMs: allowed ? 0 : resetAt - now,
        };
      }
      console.warn("[rate-limit] Supabase RPC error, falling back to memory:", error?.message);
    } catch (e) {
      console.warn("[rate-limit] Supabase unavailable, falling back to memory:", e);
    }
  }

  // ── In-memory fallback ──────────────────────────────────────────────────
  let record = fallbackStore.get(identifier);
  if (!record || record.resetAt <= now) {
    record = { count: 0, resetAt };
    fallbackStore.set(identifier, record);
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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  return `ip:${ip}`;
}
