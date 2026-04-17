import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('GET /api/health', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.NEXT_PUBLIC_APP_VERSION = '0.1.0-test';
  });

  it('returns 200 and status "ok" when DB query succeeds', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.checks.database.status).toBe('ok');
  });

  it('returns 503 and status "degraded" when DB query fails', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: { message: 'Connection refused' } }),
        }),
      }),
    } as any);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.checks.database.status).toBe('error');
  });

  it('includes version, timestamp, and uptime_ms', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any);

    const res = await GET();
    const body = await res.json();

    expect(body.version).toBe('0.1.0-test');
    expect(body.timestamp).toBeTruthy();
    expect(new Date(body.timestamp).getTime()).not.toBeNaN();
    expect(typeof body.uptime_ms).toBe('number');
  });

  it('reports gemini_key_set=true when GEMINI_API_KEY is present', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any);
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const res = await GET();
    const body = await res.json();
    expect(body.checks.ai.gemini_key_set).toBe(true);
  });
});
