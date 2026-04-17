import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/waitlist/route';

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientId: vi.fn().mockReturnValue('127.0.0.1'),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/waitlist', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    delete process.env.RESEND_API_KEY;

    const { rateLimit } = await import('@/lib/rate-limit');
    vi.mocked(rateLimit).mockResolvedValue({
      allowed: true, remaining: 2, resetAt: Date.now() + 3_600_000, retryAfterMs: 0,
    });

    const { createAdminClient } = await import('@/lib/supabase/server');
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as any);
  });

  it('returns 200 for a valid email signup', async () => {
    const res = await POST(makeRequest({ email: 'agent@example.com', name: 'Agent Smith', role: 'agent' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 400 for a missing email field', async () => {
    const res = await POST(makeRequest({ name: 'No Email' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it('returns 400 for an unparseable JSON body', async () => {
    const req = new NextRequest('http://localhost/api/waitlist', {
      method: 'POST',
      body: '{broken',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    vi.mocked(rateLimit).mockResolvedValue({
      allowed: false, remaining: 0, resetAt: Date.now() + 3_600_000, retryAfterMs: 3_600_000,
    });
    const res = await POST(makeRequest({ email: 'flood@example.com' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });

  it('normalises email to lowercase before upsert', async () => {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: upsertMock }),
    } as any);

    await POST(makeRequest({ email: 'UPPER@EXAMPLE.COM' }));
    expect(upsertMock.mock.calls[0][0].email).toBe('upper@example.com');
  });

  it('strips leading/trailing whitespace from email', async () => {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert: upsertMock }),
    } as any);

    await POST(makeRequest({ email: '  trim@example.com  ' }));
    expect(upsertMock.mock.calls[0][0].email).toBe('trim@example.com');
  });
});
