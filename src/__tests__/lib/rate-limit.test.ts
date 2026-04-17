import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Rate-limiter tests — exercises the in-memory fallback path.
 * Supabase credentials are cleared so the function uses the module-level Map store.
 */
describe('rateLimit() — in-memory fallback', () => {
  const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if (origUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    if (origKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  });

  it('allows the first request', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit(`test-${Date.now()}-a`, { maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('decrements remaining on subsequent calls', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const id = `test-${Date.now()}-b`;
    const r1 = await rateLimit(id, { maxRequests: 3, windowMs: 60_000 });
    const r2 = await rateLimit(id, { maxRequests: 3, windowMs: 60_000 });
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
  });

  it('blocks requests when the limit is exceeded', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const id = `test-${Date.now()}-c`;
    await rateLimit(id, { maxRequests: 2, windowMs: 60_000 });
    await rateLimit(id, { maxRequests: 2, windowMs: 60_000 });
    const blocked = await rateLimit(id, { maxRequests: 2, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('populates retryAfterMs when rate limited', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const id = `test-${Date.now()}-d`;
    await rateLimit(id, { maxRequests: 1, windowMs: 60_000 });
    const blocked = await rateLimit(id, { maxRequests: 1, windowMs: 60_000 });
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('provides a resetAt timestamp in the future', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit(`test-${Date.now()}-e`, { maxRequests: 5, windowMs: 60_000 });
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  it('uses maxRequests=20 as default', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit(`test-${Date.now()}-f`);
    expect(result.remaining).toBe(19);
  });
});
