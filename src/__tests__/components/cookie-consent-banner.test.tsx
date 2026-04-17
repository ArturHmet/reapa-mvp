import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CookieConsentBanner, getStoredConsent } from '@/components/CookieConsentBanner';

const CONSENT_KEY = 'reapa_cookie_consent';

// Mock next/link so it renders a plain anchor in jsdom
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('does not render the dialog immediately', () => {
    render(<CookieConsentBanner />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the banner after the 800ms delay when no consent stored', async () => {
    render(<CookieConsentBanner />);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('does not render if consent is already stored as "accepted"', async () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    render(<CookieConsentBanner />);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hides the banner and stores "accepted" when Accept is clicked', async () => {
    render(<CookieConsentBanner />);
    await act(async () => { vi.advanceTimersByTime(900); });

    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptBtn);

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(CONSENT_KEY)).toBe('accepted');
  });

  it('hides the banner and stores "declined" when Essential Only is clicked', async () => {
    render(<CookieConsentBanner />);
    await act(async () => { vi.advanceTimersByTime(900); });

    const declineBtn = screen.getByRole('button', { name: /essential/i });
    fireEvent.click(declineBtn);

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(CONSENT_KEY)).toBe('declined');
  });

  it('dispatches reapa:consent event with accepted=true on accept', async () => {
    render(<CookieConsentBanner />);
    await act(async () => { vi.advanceTimersByTime(900); });

    const events: CustomEvent[] = [];
    window.addEventListener('reapa:consent', (e) => events.push(e as CustomEvent));

    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(events[0]?.detail?.accepted).toBe(true);
  });
});

describe('getStoredConsent()', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing is stored', () => {
    expect(getStoredConsent()).toBeNull();
  });

  it('returns "accepted" after accept', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    expect(getStoredConsent()).toBe('accepted');
  });

  it('returns "declined" after decline', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    expect(getStoredConsent()).toBe('declined');
  });
});
