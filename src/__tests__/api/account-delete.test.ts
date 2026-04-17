import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '@/app/api/account/delete/route';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

describe('DELETE /api/account/delete', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    } as any);
  });

  it('returns 401 when no user session exists', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
      from: vi.fn(),
    } as any);

    const res = await DELETE();
    const body = await res.json();
    expect(res.status).toBe(401);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 200 when authenticated (SUPABASE_SERVICE_ROLE_KEY not set — data deleted, auth skipped)', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const eqMock = vi.fn().mockReturnValue({ throwOnError: vi.fn().mockResolvedValue({}) });
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'uid-123', email: 'user@example.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: eqMock }) }),
    } as any);

    const res = await DELETE();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
