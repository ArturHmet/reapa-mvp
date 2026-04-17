import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatTime, timeAgo } from '@/lib/utils';

describe('cn()', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo');
  });
  it('merges two class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  it('ignores falsy values', () => {
    const skip = false;
    expect(cn('foo', skip && 'skip', undefined, 'bar')).toBe('foo bar');
  });
  it('handles conditional object syntax', () => {
    const result = cn({ active: true, hidden: false });
    expect(result).toContain('active');
    expect(result).not.toContain('hidden');
  });
});

describe('formatCurrency()', () => {
  it('formats a positive amount as EUR', () => {
    const result = formatCurrency(1000);
    expect(result).toMatch(/1[,.]?000/);
    expect(result).toMatch(/€|EUR/);
  });
  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/0/);
    expect(result).toMatch(/€|EUR/);
  });
  it('formats large amounts', () => {
    const result = formatCurrency(1_500_000);
    expect(result).toContain('500');
  });
});

describe('formatDate()', () => {
  it('returns a non-empty string', () => {
    const result = formatDate('2026-04-17T10:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
  it('includes the year', () => {
    const result = formatDate('2026-04-17T10:00:00Z');
    expect(result).toContain('2026');
  });
});

describe('formatTime()', () => {
  it('returns a string matching HH:MM pattern', () => {
    const result = formatTime('2026-04-17T09:30:00Z');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('timeAgo()', () => {
  it('returns "Just now" for a timestamp within the last minute', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('Just now');
  });
  it('returns minutes for a recent timestamp', () => {
    const d = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(d)).toBe('5m ago');
  });
  it('returns hours for a timestamp a few hours ago', () => {
    const d = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(timeAgo(d)).toBe('3h ago');
  });
  it('returns days for a timestamp several days ago', () => {
    const d = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(timeAgo(d)).toBe('2d ago');
  });
});
