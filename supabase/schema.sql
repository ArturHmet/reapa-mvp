-- REAPA Supabase Database Schema
-- Run this in Supabase SQL editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  agency TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  score INTEGER DEFAULT 0,
  temperature TEXT DEFAULT 'ice' CHECK (temperature IN ('hot', 'warm', 'cold', 'ice')),
  intent TEXT CHECK (intent IN ('buy', 'sell', 'rent', 'valuation', 'browse')),
  budget_range TEXT,
  location TEXT,
  timeline TEXT,
  financing_status TEXT,
  source TEXT DEFAULT 'chat' CHECK (source IN ('chat', 'email', 'whatsapp', 'portal', 'instagram', 'facebook', 'referral', 'manual')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost', 'nurture')),
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  chat_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_areas TEXT[],
  property_type TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  notes TEXT,
  aml_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  description_en TEXT,
  description_mt TEXT,
  description_ru TEXT,
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'villa', 'penthouse', 'townhouse', 'commercial', 'land')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending', 'sold', 'withdrawn')),
  price INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  location TEXT,
  locality TEXT,
  epc_rating TEXT CHECK (epc_rating IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  epc_expires_at DATE,
  housing_authority_ref TEXT,
  images TEXT[],
  portal_ids JSONB DEFAULT '{}',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  client_id UUID REFERENCES clients(id),
  listing_id UUID REFERENCES listings(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('follow_up', 'viewing', 'offer', 'document', 'compliance', 'general')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('aml_check', 'kyc', 'epc', 'housing_authority', 'promise_of_sale', 'final_deed', 'fiau_report')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
  reference_number TEXT,
  document_url TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_own_data" ON agents FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "leads_own_data" ON leads FOR ALL USING (agent_id::text = auth.uid()::text);
CREATE POLICY "clients_own_data" ON clients FOR ALL USING (agent_id::text = auth.uid()::text);
CREATE POLICY "listings_own_data" ON listings FOR ALL USING (agent_id::text = auth.uid()::text);
CREATE POLICY "tasks_own_data" ON tasks FOR ALL USING (agent_id::text = auth.uid()::text);
CREATE POLICY "compliance_own_data" ON compliance_records FOR ALL USING (agent_id::text = auth.uid()::text);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();