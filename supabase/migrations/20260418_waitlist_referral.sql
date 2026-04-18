-- Sprint 11: waitlist referral tracking
-- Run via Supabase SQL editor: https://supabase.com/dashboard/project/iwcgyfyfotbqcmohwbda/editor

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name       TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS role       TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS language   TEXT NOT NULL DEFAULT 'en';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS referred_by   TEXT;

-- Index for fast lookup when generating codes
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
-- Index for counting referral conversions
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by   ON waitlist(referred_by);
