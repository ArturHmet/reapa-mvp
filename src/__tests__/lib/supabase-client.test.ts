import { describe, it, expect, afterEach } from 'vitest';
import { isSupabaseConfigured } from '@/lib/supabase/client';

describe('isSupabaseConfigured()', () => {
  const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    if (origUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
  });

  it('returns false when NEXT_PUBLIC_SUPABASE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false when URL contains "placeholder"', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns true when a real project URL is set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://iwcgyfyfotbqcmohwbda.supabase.co';
    expect(isSupabaseConfigured()).toBe(true);
  });
});
