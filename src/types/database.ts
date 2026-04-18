/**
 * Supabase database type stubs. All Insert/Update types inlined.
 * Relationships: never[] required by @supabase/supabase-js v2 GenericTable.
 * Views/Enums/CompositeTypes required by GenericSchema shape.
 */
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: { id: string; email: string; full_name: string; agency_name: string | null; city: string; language: string; timezone: string; subscription_tier: string; created_at: string; updated_at: string; };
        Insert: { email: string; full_name: string; city: string; language: string; timezone: string; subscription_tier: string; agency_name?: string | null; };
        Update: { email?: string; full_name?: string; city?: string; language?: string; timezone?: string; subscription_tier?: string; agency_name?: string | null; };
        Relationships: never[];
      };
      leads: {
        Row: { id: string; name: string; email: string | null; phone: string | null; source: "chat"|"manual"|"email"|"portal"|"instagram"|"facebook"|"whatsapp"|"referral"|null; score: number | null; temperature: "hot"|"warm"|"cold"|"ice"|null; intent: "buy"|"rent"|"sell"|null; budget_range: string | null; location: string | null; notes: string | null; last_contact_at: string | null; created_at: string; agent_id?: string | null; };
        Insert: { name: string; email?: string | null; phone?: string | null; source?: "chat"|"manual"|"email"|"portal"|"instagram"|"facebook"|"whatsapp"|"referral"|null; score?: number | null; temperature?: "hot"|"warm"|"cold"|"ice"|null; intent?: "buy"|"rent"|"sell"|null; budget_range?: string | null; location?: string | null; notes?: string | null; last_contact_at?: string | null; agent_id?: string | null; };
        Update: { name?: string; email?: string | null; phone?: string | null; source?: "chat"|"manual"|"email"|"portal"|"instagram"|"facebook"|"whatsapp"|"referral"|null; score?: number | null; temperature?: "hot"|"warm"|"cold"|"ice"|null; intent?: "buy"|"rent"|"sell"|null; budget_range?: string | null; location?: string | null; notes?: string | null; last_contact_at?: string | null; agent_id?: string | null; };
        Relationships: never[];
      };
      clients: {
        Row: { id: string; name: string; email: string | null; phone: string | null; nationality: string | null; budget_min: number | null; budget_max: number | null; preferred_areas: string[] | null; property_type: string[] | null; status: "active"|"paused"|"closed"|null; notes: string | null; aml_verified: boolean | null; created_at: string; updated_at: string; agent_id?: string | null; };
        Insert: { name: string; email?: string | null; phone?: string | null; nationality?: string | null; budget_min?: number | null; budget_max?: number | null; preferred_areas?: string[] | null; property_type?: string[] | null; status?: "active"|"paused"|"closed"|null; notes?: string | null; aml_verified?: boolean | null; agent_id?: string | null; };
        Update: { name?: string; email?: string | null; phone?: string | null; nationality?: string | null; budget_min?: number | null; budget_max?: number | null; preferred_areas?: string[] | null; property_type?: string[] | null; status?: "active"|"paused"|"closed"|null; notes?: string | null; aml_verified?: boolean | null; agent_id?: string | null; };
        Relationships: never[];
      };
      tasks: {
        Row: { id: string; title: string; description: string | null; type: "follow_up"|"viewing"|"document"|"compliance"|"offer"|"other"|null; priority: "critical"|"high"|"medium"|"low"|null; status: "pending"|"in_progress"|"completed"|"cancelled"|null; due_at: string | null; ai_generated: boolean | null; lead_id: string | null; client_id: string | null; created_at: string; agent_id?: string | null; };
        Insert: { title: string; description?: string | null; type?: "follow_up"|"viewing"|"document"|"compliance"|"offer"|"other"|null; priority?: "critical"|"high"|"medium"|"low"|null; status?: "pending"|"in_progress"|"completed"|"cancelled"|null; due_at?: string | null; ai_generated?: boolean | null; lead_id?: string | null; client_id?: string | null; agent_id?: string | null; };
        Update: { title?: string; description?: string | null; type?: "follow_up"|"viewing"|"document"|"compliance"|"offer"|"other"|null; priority?: "critical"|"high"|"medium"|"low"|null; status?: "pending"|"in_progress"|"completed"|"cancelled"|null; due_at?: string | null; ai_generated?: boolean | null; lead_id?: string | null; client_id?: string | null; agent_id?: string | null; };
        Relationships: never[];
      };
      rate_limits: {
        Row: { key: string; count: number; window_start: string; };
        Insert: { key: string; count: number; };
        Update: { key?: string; count?: number; window_start?: string; };
        Relationships: never[];
      };
      waitlist: {
        Row: { id: string; email: string; name: string | null; role: string | null; language: string; source: string | null; referral_code: string | null; referred_by: string | null; created_at: string; };
        Insert: { email: string; name?: string | null; role?: string | null; language?: string; source?: string | null; referral_code?: string | null; referred_by?: string | null; };
        Update: { email?: string; name?: string | null; role?: string | null; language?: string; source?: string | null; referral_code?: string | null; referred_by?: string | null; };
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_rate_limit: { Args: { p_key: string; p_window_seconds: number }; Returns: number; };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
