-- S12-6: Create lead_profiles table for Stage 6 NLP structured extraction results
-- Migration: 20260420_lead_profiles.sql

CREATE TABLE IF NOT EXISTS public.lead_profiles (
  id               uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id  text         NOT NULL,
  budget_range     text,
  property_type    text,
  timeline_urgency text         NOT NULL DEFAULT 'unknown',
  location_preference text,
  contact_intent   text         NOT NULL DEFAULT 'unknown',
  extracted_at     timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT uq_lead_profile_conversation UNIQUE (conversation_id)
);

-- Index for fast lookups by conversation_id
CREATE INDEX IF NOT EXISTS idx_lead_profiles_conversation_id
  ON public.lead_profiles (conversation_id);

-- RLS: admin-only read/write (service role bypasses RLS)
ALTER TABLE public.lead_profiles ENABLE ROW LEVEL SECURITY;
